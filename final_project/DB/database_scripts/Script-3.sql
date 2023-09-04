
--EXPLAIN ANALYZE
select co.gu_name, co.dong_name, a.인구이동총합, i."커피.음료", coalesce(b.지하철이용객총합,0) "지하철이용객총합", coalesce(b.지하철개수,0) "지하철개수", 
		c.버스이용객총합, c.버스정류장개수, coalesce(d.대학상권개수,0) "대학상권개수", coalesce(e.공원시설개수,0) "공원시설개수", 
		coalesce(f.집객시설개수,0) "집객시설개수", coalesce(g.문화시설개수, 0) "문화시설개수", h.주차장개수, h.주차장면적
from code co
	left join (select dong_code, sum(sum_move_pop) as "인구이동총합"
					 from move_pop_plist_강남구
					 where dong_code in (select dong_code from code where gu_name = '강남구')
					 group by dong_code) a on (co.dong_code=a.dong_code)
	left join (select dong_code, sum(getoff_num) as "지하철이용객총합", count(subway_name) as "지하철개수"
					 from subwaystation
					 where dong_code in (select dong_code from code where gu_name = '강남구')
					 group by dong_code) b on (co.dong_code=b.dong_code)
	left join (select dong_code, sum(getoff_num) as "버스이용객총합", count(distinct busstop_name) as "버스정류장개수"
					 from busstop
					 where dong_code in (select dong_code from code where gu_name = '강남구')
					 group by dong_code) c on (co.dong_code=c.dong_code)
	left join (select dong_code, count(uni_name) as "대학상권개수"
				 	 from university
				 	 where dong_code in (select dong_code from code where gu_name = '강남구')
					 group by dong_code) d on (co.dong_code=d.dong_code)
	left join (select dong_code, count(park_name) as "공원시설개수"
					 from park p 
					 where dong_code in (select dong_code from code where gu_name = '강남구')
					 group by dong_code) e on (co.dong_code=e.dong_code)
	left join (select dong_code, count(store_name) as "집객시설개수"
				 	 from attraction_facilities
				 	 where dong_code in (select dong_code from code where gu_name = '강남구')
				  	 group by dong_code) f on (co.dong_code=f.dong_code)
	left join (select dong_code, count(culture_name) as "문화시설개수"
					 from cultures
					 where dong_code in (select dong_code from code where gu_name = '강남구')
					 group by dong_code) g on (co.dong_code=g.dong_code)
	left join (select dong_code, sum(parking_count) as "주차장개수", sum(parking_area) "주차장면적"
					 from parking_lot
					 where dong_code in (select dong_code from code where gu_name = '강남구')
					 group by dong_code) h on (co.dong_code=h.dong_code)
	left join (select dong_code, 
						coalesce(sum(case when store_type='커피.음료' then 1 end),0) "커피.음료"
					 from store
					 where dong_code in (select dong_code from code where gu_name = '강남구')
					 group by dong_code) i on (co.dong_code=i.dong_code)
where co.dong_code in (select dong_code from code where gu_name = '강남구');

select i."커피.음료"
from star_table i;
