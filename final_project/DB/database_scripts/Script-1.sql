select * from mpop.move_pop;

update mpop.move_pop
set sigungu_code = case 
	when arr_code in (select dong_code from code where sigungu_code=11010) then 11010
	when arr_code in (select dong_code from code where sigungu_code=11020) then 11020
	when arr_code in (select dong_code from code where sigungu_code=11030) then 11030
	when arr_code in (select dong_code from code where sigungu_code=11040) then 11040
	when arr_code in (select dong_code from code where sigungu_code=11050) then 11050
	when arr_code in (select dong_code from code where sigungu_code=11060) then 11060
	when arr_code in (select dong_code from code where sigungu_code=11070) then 11070
	when arr_code in (select dong_code from code where sigungu_code=11080) then 11080
	when arr_code in (select dong_code from code where sigungu_code=11090) then 11090
	when arr_code in (select dong_code from code where sigungu_code=11100) then 11100
	when arr_code in (select dong_code from code where sigungu_code=11110) then 11110
	when arr_code in (select dong_code from code where sigungu_code=11120) then 11120
	when arr_code in (select dong_code from code where sigungu_code=11130) then 11130
	when arr_code in (select dong_code from code where sigungu_code=11140) then 11140
	when arr_code in (select dong_code from code where sigungu_code=11150) then 11150
	when arr_code in (select dong_code from code where sigungu_code=11160) then 11160
	when arr_code in (select dong_code from code where sigungu_code=11170) then 11170
	when arr_code in (select dong_code from code where sigungu_code=11180) then 11180
	when arr_code in (select dong_code from code where sigungu_code=11190) then 11190
	when arr_code in (select dong_code from code where sigungu_code=11200) then 11200
	when arr_code in (select dong_code from code where sigungu_code=11210) then 11210
	when arr_code in (select dong_code from code where sigungu_code=11220) then 11220
	when arr_code in (select dong_code from code where sigungu_code=11230) then 11230
	when arr_code in (select dong_code from code where sigungu_code=11240) then 11240
	when arr_code in (select dong_code from code where sigungu_code=11250) then 11250
end ;
	
select distinct sigungu_code
from move_pop;

commit;



-- move_pop 파티셔닝

create materialized view mpop.mv_move_pop as select * from mpop.move_pop;


select * from code where dong_name like '%가양%';


select b.dong_name, c.dong_name, c.dong_code
from busstop b left join code c on (b.gu_name=c.gu_name and b.dong_name=c.dong_name);

select * 
from code mp 
where dong_name like '%,%';



-- move_pop_plist dong_name update하기
update move_pop_plist as p 
set
	dong_name = c.dong_name
from  code as c
where c.dong_code = p.dong_code ;


-- busstop dong_code update하기
update busstop as b 
set
	dong_code = c.dong_code
from  code as c
where (c.gu_name = b.gu_name and c.dong_name = b.dong_name) ;


select distinct  dong_name from move_pop_plist_종로구  ;


select * from busstop;

select * from busstop where dong_code is null;

select * from code where gu_name = '강동구';


update busstop b set dong_name = '면목3.8동' where dong_name = '면목제3.8동';

-- 누락 행정동 코드 추가(항동)
insert into code values(11170,1117074,'구로구', '항동', '서울특별시 구로구 항동');

-- 상일 1,2동 -> 상일동으로
update busstop b set dong_name = '상일동' where dong_name like '상일%';
 

-- university dong_code 삽입
update university as u 
set
	dong_code = c.dong_code
from  code as c
where (c.gu_name = u.gu_name and c.dong_name = u.dong_name) ;

select count(*) from university u where dong_code is null;

select * from university u where dong_code is null;

update university set dong_name = '면목3.8동' where dong_name = '면목제3.8동';


-- park dong_code 삽입
update park p
set
	dong_code = c.dong_code
from  code as c
where (c.gu_name = p.gu_name and c.dong_name = p.dong_name) ;

select count(*) from park p  where dong_code is null;

select * from park p where dong_code is null;


select * from code where gu_name ='용산구';

update park set dong_name = '면목3.8동' where dong_name = '면목제3.8동';

update park set dong_name = '필동' where park_name = '남산도시자연공원';

update park set dong_name = '상일동' where dong_name like '상일%';

update park set dong_name = '신사2동' where park_name = '봉산도시자연공원';

update park set dong_name = '우이동' where park_name = '북한산국립공원';

update park set dong_name = '공릉2동' where park_name = '불암산도시자연공원';

update park set dong_name = '상도1동' where park_name = '상도근린공원';

update park set dong_name = '상계1동' where park_name = '수락산도시자연공원';

update park set dong_name = '양재2동' where park_name = '청계산도시자연공원';


-- subwaystation dong_code 삽입
update subwaystation s
set
	dong_code = c.dong_code
from  code as c
where (c.gu_name = s.gu_name and c.dong_name = s.dong_name) ;

select count(*) from subwaystation s  where dong_code is null;
select * from subwaystation s  where dong_code is null;
select * from code where gu_name ='중랑구';
update subwaystation  set dong_name = '상일동' where dong_name like '상일%';
update subwaystation  set dong_name = '면목3.8동' where dong_name = '면목제3.8동';

-- cultures dong_code 삽입
update cultures u
set
	dong_code = c.dong_code
from  code as c
where (c.gu_name = u.gu_name and c.dong_name = u.dong_name) ;

select count(*) from cultures  where dong_code is null;
select * from cultures  where dong_code is null order by dong_name ;
select * from code where gu_name ='강남구';

update cultures  set dong_name = '상일동' where dong_name  = '상일1동' ;

update cultures  set gu_name = '종로구' where culture_name in ('선갤러리', '조형갤러리', '공갤러리', '브레이크 아웃 전용극장', '덕원갤러리', '극단연우무대') ;
update cultures  set gu_name = '마포구' where culture_name = 'SJ비보이극장' ;
update cultures  set gu_name = '서초구' where culture_name = '서초문화원' ;
update cultures  set gu_name = '강남구' where culture_name = '강남구립열린도서관' ;
update cultures  set gu_name = '중구' where culture_name = '예지원' ;
update cultures  set gu_name = '송파구' where culture_name = '롯데콘서트홀' ;



-- parking dong_code 삽입
update parking_lot as p
set
	dong_code = c.dong_code
from  code as c
where (c.gu_name = p.gu_name and c.dong_name = p.dong_name) ;

select count(*) from parking_lot pl  where dong_code is null;

select * from parking_lot pl  where dong_code is null;

select * from code where gu_name ='강동구';

update parking_lot  set dong_name = '상일동' where dong_name  = '상일1동';


select * from parking_lot pl ;


-- attraction_facilities dong_code 삽입
update attraction_facilities af
set
	dong_code = c.dong_code
from  code as c
where (c.gu_name =af.gu_name and c.dong_name = af.dong_name) ;

select count(*) from attraction_facilities af  where dong_code is null;

select * from attraction_facilities af  where dong_code is null;

update attraction_facilities set dong_name = '면목3.8동' where dong_name = '면목제3.8동';


-- store dong_code 삽입
update store s
set
	dong_code = c.dong_code
from  code as c
where (c.gu_name =s.gu_name and c.dong_name = s.dong_name) ;

select count(*) from store where dong_code is null;

select store_name from store s  where dong_code is null;

update store set dong_name = '면목3.8동' where dong_name = '면목제3.8동';
update store set dong_name = '상일동' where dong_name  = '상일1동';
update store set dong_name = '상일동' where dong_name  = '상일2동';

delete from store where store_name in (select store_name from store s where dong_code is null);

SELECT * FROM code WHERE dong_name LIKE '%.%';

-- 주변시설 동별 갯수 뷰 _ cultures 와 park 테이블
create view culture_count_view as (
((select gu_name, dong_name, type, count(*)
from cultures c 
group by gu_name, dong_name , type)
union all
(select gu_name, dong_name, '공원' as type, count(*)
from park
group by gu_name, dong_name
order by gu_name)));

select * from cultures c ;
select * from park;

(select gu_name, dong_name, type, count(*)
from cultures c 
group by gu_name, dong_name , type)
union all
(select gu_name, dong_name, '공원' as type, count(*)
from park
group by gu_name, dong_name
order by gu_name);




