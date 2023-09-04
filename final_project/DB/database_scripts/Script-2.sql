--star table query 작성

-- input data : gu_name, upjong
-- 	gu : 강남구
--  upjong : 커피.음료

-- table 목록
select tablename from pg_tables where schemaname = 'mpop' order by tablename;

--tablename             |
------------------------+
--attraction_facilities |
--busstop               |
--code                  |
--code_gu               |
--cultures              |
--move_pop              |
--move_pop_plist        |
--move_pop_plist_default|
--move_pop_plist_강남구    |
--move_pop_plist_강동구    |
--move_pop_plist_강북구    |
--move_pop_plist_강서구    |
--move_pop_plist_관악구    |
--move_pop_plist_광진구    |
--move_pop_plist_구로구    |
--move_pop_plist_금천구    |
--move_pop_plist_노원구    |
--move_pop_plist_도봉구    |
--move_pop_plist_동대문구   |
--move_pop_plist_동작구    |
--move_pop_plist_마포구    |
--move_pop_plist_서대문구   |
--move_pop_plist_서초구    |
--move_pop_plist_성동구    |
--move_pop_plist_성북구    |
--move_pop_plist_송파구    |
--move_pop_plist_양천구    |
--move_pop_plist_영등포구   |
--move_pop_plist_용산구    |
--move_pop_plist_은평구    |
--move_pop_plist_종로구    |
--move_pop_plist_중구     |
--move_pop_plist_중랑구    |
--park                  |
--parking_lot           |
--store                 |
--subwaystation         |
--type                  |
--university            

-- store type에 영향을 받지 않는 데이터
-- 구별 동별 총 이동 수 
select c.gu_name, m.dong_name, sum(sum_move_pop)
from move_pop_plist_강남구 m join code c on m.dong_code=c.dong_code 
group by gu_name, m.dong_name;

-- 지하철 이용 수, 지하철 개수
select gu_name, dong_name, sum(getoff_num) as "지하철이용객총합", count(subway_name) as "지하철 개수"
from subwaystation
group by gu_name, dong_name;

-- 구별 동별 버스정류장 이용 수, 버스정류장 개수
select gu_name, dong_name, sum(getoff_num) as "버스이용객총합", count(distinct busstop_name) as "버스정류장개수"
from busstop
group by gu_name, dong_name;

-- 구별 동별 대학교 현황 ( 대학 상권 )
select gu_name, dong_name, count(uni_name) as "대학상권개수"
from university
group by gu_name, dong_name;

-- 공원 현황
select gu_name, dong_name, count(park_name) as "공원시설개수"
from park p 
group by gu_name, dong_name;

-- 구별 동별 집객시설 수 
select gu_name, dong_name, count(store_name) as "집객시설개수"
from attraction_facilities
group by gu_name , dong_name ;

-- 문화시설
select gu_name, dong_name, count(culture_name) as "문화시설개수"
from cultures
group by gu_name, dong_name;

-- 주차장 개수
select gu_name, dong_name, sum(parking_count) as "주차장개수", sum(parking_area) "주차장면적"
from parking_lot
group by gu_name, dong_name;




--create or replace view star_table_view_01 as(
--select gu_name, dong_name from code order by gu_name, dong_name);

create materialized view star_table_MV as(
select c.gu_name, m.dong_name, sum(sum_move_pop) as "인구이동총합"
			from move_pop_plist m join code c on m.dong_code=c.dong_code 
			group by gu_name, m.dong_name);

		
select * from star_table_mv;


create or replace view stv_01 as (
select s.*, m.지하철이용객총합, m.지하철개수
from star_table_MV s 
left outer join (select gu_name, dong_name, sum(getoff_num) as "지하철이용객총합", count(subway_name) as "지하철개수"
					from subwaystation
					group by gu_name, dong_name) m 
on (s.gu_name=m.gu_name and s.dong_name=m.dong_name));


create or replace view stv_02 as( 
select s.*, m.버스이용객총합, m.버스정류장개수
from stv_01 s 
left outer join (select gu_name, dong_name, sum(getoff_num) as "버스이용객총합", count(distinct busstop_name) as "버스정류장개수"
				from busstop
				group by gu_name, dong_name) m 
on (s.gu_name=m.gu_name and s.dong_name=m.dong_name));


create or replace view stv_03 as( 
select s.*, m.대학상권개수
from stv_02 s 
left outer join (select gu_name, dong_name, count(uni_name) as "대학상권개수"
			 	 from university
				 group by gu_name, dong_name) m
on (s.gu_name=m.gu_name and s.dong_name=m.dong_name));


create view stv_04 as( 
select s.*, m.공원시설개수
from stv_03 s 
left outer join (select gu_name, dong_name, count(park_name) as "공원시설개수"
				from park p 
				group by gu_name, dong_name) m 
on (s.gu_name=m.gu_name and s.dong_name=m.dong_name));

create view stv_05 as( 
select s.*, m.집객시설개수
from stv_04 s 
left outer join (select gu_name, dong_name, count(store_name) as "집객시설개수"
				from attraction_facilities
				group by gu_name , dong_name ) m 
on (s.gu_name=m.gu_name and s.dong_name=m.dong_name));

create view stv_06 as( 
select s.*, m.문화시설개수
from stv_05 s 
left outer join (select gu_name, dong_name, count(culture_name) as "문화시설개수"
				from cultures
				group by gu_name, dong_name) m 
on (s.gu_name=m.gu_name and s.dong_name=m.dong_name));

create view stv_07 as( 
select s.*, m.주차장개수, m.주차장면적
from stv_06 s 
left outer join (select gu_name, dong_name, sum(parking_count) as "주차장개수", sum(parking_area) "주차장면적"
					from parking_lot
					group by gu_name, dong_name) m 
on (s.gu_name=m.gu_name and s.dong_name=m.dong_name));

create view stv_08 as( 
select s.*, m."분식전문점", m."호프.간이주점", m."양식음식점", m."제과점", m."한식음식점", m."중식음식점", m."편의점", m."일식음식점", m."커피.음료", m."패스트푸드점", m."치킨전문점", m."슈퍼마켓"
from stv_07 s 
left outer join (select gu_name, dong_name, 
					coalesce(sum(case when store_type='분식전문점' then 1 end),0) as "분식전문점",
					coalesce(sum(case when store_type='호프.간이주점' then 1 end),0) "호프.간이주점",
					coalesce(sum(case when store_type='양식음식점' then 1 end),0) "양식음식점",
					coalesce(sum(case when store_type='제과점' then 1 end),0) "제과점",
					coalesce(sum(case when store_type='한식음식점' then 1 end),0) "한식음식점",
					coalesce(sum(case when store_type='중식음식점' then 1 end),0) "중식음식점",
					coalesce(sum(case when store_type='편의점' then 1 end),0) "편의점",
					coalesce(sum(case when store_type='일식음식점' then 1 end),0) "일식음식점",
					coalesce(sum(case when store_type='커피.음료' then 1 end),0) "커피.음료",
					coalesce(sum(case when store_type='패스트푸드점' then 1 end),0) "패스트푸드점",
					coalesce(sum(case when store_type='치킨전문점' then 1 end),0) "치킨전문점",
					coalesce(sum(case when store_type='슈퍼마켓' then 1 end),0) "슈퍼마켓"
				from store
				group by gu_name, dong_name) m 
on (s.gu_name=m.gu_name and s.dong_name=m.dong_name));

explain
select * from stv_08;


select * from move_pop_plist mpp  where dong_name like '%·%';

select distinct store_type from store;

select count(*)-count(버스정류장개수) from stv_07;

create table star_table as(
select gu_name, dong_name, 인구이동총합, coalesce(지하철이용객총합,0) "지하철이용객총합", coalesce(지하철개수,0) "지하철개수", 
		버스이용객총합, 버스정류장개수, coalesce(대학상권개수,0) "대학상권개수", coalesce(공원시설개수,0) "공원시설개수", 
		coalesce(집객시설개수,0) "집객시설개수", coalesce(문화시설개수, 0) "문화시설개수", 주차장개수, 주차장면적, 
		분식전문점,"호프.간이주점",양식음식점,제과점,한식음식점,중식음식점,편의점,일식음식점,"커피.음료",패스트푸드점,치킨전문점,슈퍼마켓

from stv_08); 




select distinct store_type from store;

select gu_name, dong_name, 
		coalesce(sum(case when store_type='분식전문점' then 1 end),0) as "분식전문점",
		coalesce(sum(case when store_type='호프.간이주점' then 1 end),0) "호프.간이주점",
		coalesce(sum(case when store_type='양식음식점' then 1 end),0) "양식음식점",
		coalesce(sum(case when store_type='제과점' then 1 end),0) "제과점",
		coalesce(sum(case when store_type='한식음식점' then 1 end),0) "한식음식점",
		coalesce(sum(case when store_type='중식음식점' then 1 end),0) "중식음식점",
		coalesce(sum(case when store_type='편의점' then 1 end),0) "편의점",
		coalesce(sum(case when store_type='일식음식점' then 1 end),0) "일식음식점",
		coalesce(sum(case when store_type='커피.음료' then 1 end),0) "커피.음료",
		coalesce(sum(case when store_type='패스트푸드점' then 1 end),0) "패스트푸드점",
		coalesce(sum(case when store_type='치킨전문점' then 1 end),0) "치킨전문점",
		coalesce(sum(case when store_type='슈퍼마켓' then 1 end),0) "슈퍼마켓"
from store
group by gu_name, dong_name
order by 1;

create extension tablefunc;

select * 
from crosstab(
	'select dong_code, store_type, coalesce(count(store_name),0) "total"
	from store
	group by dong_code, store_type',
	'select distinct store_type from store order by store_type')
	as (dong_code int, 
		"호프.간이주점" int, 
		양식음식점 int,
		한식음식점 int, 
		제과점 int,   
		중식음식점 int, 
		편의점 int,   
		일식음식점 int, 
		분식전문점 int, 
		"커피.음료" int, 
		패스트푸드점 int,
		치킨전문점 int, 
		슈퍼마켓 int);


select dong_code, store_type, coalesce(count(store_name),0) "total"
	from store
	group by dong_code, store_type
	order by 1;
	


select * from star_table;


select * from store where dong_name like '둔촌%';

select * from star_table where dong_name = '둔촌1동';
