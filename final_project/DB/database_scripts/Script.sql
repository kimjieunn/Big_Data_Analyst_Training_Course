--# 전체 행 --172096782
select count(*) from move_pop;

--# 년월별 행 개수
select year, month, count(*)
from move_pop
group by rollup(year, month)
order by year, month;


select year, month, sum(sum_move_pop), avg(sum_move_pop)
from move_pop
group by rollup(year, month)
order by year, month;



select arr_code, dong, arr_time, avg(sum_move_pop)
from move_pop
group by arr_code, dong, arr_time ;




ALTER TABLE mpop.code RENAME COLUMN sigungu TO sigungu_code;
ALTER TABLE mpop.code RENAME COLUMN eupmyeondong TO dong_code;
ALTER TABLE mpop.code RENAME COLUMN gu TO gu_name;
ALTER TABLE mpop.code RENAME COLUMN dong TO dong_name;


alter table mpop.code add PRIMARY KEY(dong_code);
alter table mpop.move_pop add FOREIGN KEY(arr_code) REFERENCES mpop.code(dong_code);


select year, month, sum(sum_move_pop), avg(sum_move_pop)
from move_pop
where arr_code in (select dong_code from code where gu_name='종로구')
group by rollup(year, month)
order by year, month; 

select *
from move_pop
where arr_code in (select dong_code from code where gu_name='종로구'); 


select dong, sex, count(*), sum(sum_move_pop)
from move_pop
group by grouping sets((dong, sex));


select  row_number() over (), dong_name from code order by 1 desc;

select gu_name, dong_name from code;



create view view_test as
	select gu_name, dong_name from code;
	
select * from view_test;



select distinct gu_name
from code;

select version();

select 
