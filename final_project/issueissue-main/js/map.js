//행정구역 구분
$.getJSON("resources/json/seoul_gson.geojson", function(geojson) {

   var data = geojson.features;
   var coordinates = [];   //좌표 저장할 배열
   var name = '';         //지역 구 이름
   var gucode ='';         //행정구역 코드번호
   $.each(data, function(index, val) {

      coordinates = val.geometry.coordinates;
      name = val.properties.SIG_KOR_NM;
      gucode = val.properties.orig_ogc_fid;
      
      displayArea(coordinates, name, gucode);
//      console.log(coordinates);
   })
})

var sigungucode ='';         //function recommend()의 AJAX로 지역구 코드를 보내기 위한 변수
var polygons=[];            //function 안 쪽에 지역변수로 넣으니깐 폴리곤 하나 생성할 때마다 배열이 비어서 클릭했을 때 전체를 못 없애줌.  그래서 전역변수로 만듦.
   //행정구역 폴리곤

function displayArea(coordinates, name, gucode) {

   var path = [];         //폴리곤 그려줄 path
   var points = [];      //중심좌표 구하기 위한 지역구 좌표들
   
   $.each(coordinates[0], function(index, coordinate) {      //console 보면 [0]번째에 배열이 주로 저장이 됨.  그래서 [0]번째 배열에서 꺼내줌.
      var point = new Object(); 
      point.x = coordinate[1];
      point.y = coordinate[0];
      points.push(point);
      path.push(new daum.maps.LatLng(coordinate[1], coordinate[0]));         //new daum.maps.LatLng가 없으면 인식을 못해서 path 배열에 추가
   })
   
   // 다각형을 생성합니다 
   var polygon = new daum.maps.Polygon({
      map : map, // 다각형을 표시할 지도 객체
      path : path,
      strokeWeight : 2,
      strokeColor : '#004c80',
      strokeOpacity : 0.8,
      fillColor : '#fff',
      fillOpacity : 0.7
   });
   
   
   //행정구 이름 표시
   var guName = new AddText(Centroid(points), name);
   guName.setMap(map);
   
   polygons.push(polygon);         //폴리곤 제거하기 위한 배열

   // 다각형에 mouseover 이벤트를 등록하고 이벤트가 발생하면 폴리곤의 채움색을 변경합니다 
   // 지역명을 표시하는 커스텀오버레이를 지도위에 표시합니다
   daum.maps.event.addListener(polygon, 'mouseover', function(mouseEvent) {
      polygon.setOptions({
         fillColor : '#09f'
      });

      customOverlay.setContent('<div class="area">' + name + '</div>');

      customOverlay.setPosition(mouseEvent.latLng);
      customOverlay.setMap(map);
   });

   // 다각형에 mousemove 이벤트를 등록하고 이벤트가 발생하면 커스텀 오버레이의 위치를 변경합니다 
   daum.maps.event.addListener(polygon, 'mousemove', function(mouseEvent) {

      customOverlay.setPosition(mouseEvent.latLng);
   });

   // 다각형에 mouseout 이벤트를 등록하고 이벤트가 발생하면 폴리곤의 채움색을 원래색으로 변경합니다
   // 커스텀 오버레이를 지도에서 제거합니다 
   daum.maps.event.addListener(polygon, 'mouseout', function() {
      polygon.setOptions({
         fillColor : '#fff'
      });
      customOverlay.setMap(null);
   });

   // 다각형에 click 이벤트를 등록하고 이벤트가 발생하면 해당 지역 확대, 시군구코드 넘겨줌
   daum.maps.event.addListener(polygon, 'click', function() {
      
        // 현재 지도 레벨에서 2레벨 확대한 레벨
      var level = map.getLevel()-2;
      
        // 지도를 클릭된 폴리곤의 중앙 위치를 기준으로 확대합니다
        map.setLevel(level, {anchor: Centroid(points), animate: {
            duration: 350
        }});         
        
        sigungucode = gucode;                  //클릭한 구의 시군구코드 넘겨줌            

        deletePolygon(polygons);               //폴리곤 제거      
        guName.setMap(null);               //구 이름 제거
   });

}

//centroid 알고리즘 (폴리곤 중심좌표 구하기 위함)
function Centroid(points) {
    var i, j, len, p1, p2, f, area, x, y;

    area = x = y = 0;

    for (i = 0, len = points.length, j = len - 1; i < len; j = i++) {
            p1 = points[i];
            p2 = points[j];

            f = p1.y * p2.x - p2.y * p1.x;
            x += (p1.x + p2.x) * f;
            y += (p1.y + p2.y) * f;
            area += f * 3;
    }

    return new daum.maps.LatLng(x / area, y / area);
}

var recPath = []; //라인 이을 추천 경로들의 배열
var polylines = []; //라인 담을 배열 

var arr = new Array(); //선택한 객체들 모음 
var markersArr = [];  //클릭해서 선택한 배열(빨간색)
var markers = []; //검색 결과 마커들 모음 (노란색)
var afterSearchPath = []; //검색 후 결과 배열
var afterSearchArr = new Array(); //검색 한 결과 객체들 모음
var afterpath = [];

var selectedMarker = null;

//마커 이미지와 크기지정
var marker_width = 24,
marker_height = 35,
over_marker_width = 30,
over_marker_height = 40,
sprite_marker_url = "http://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
click_marker_url = "resources/image/markerStarRed.png";

var markerSize = new daum.maps.Size(marker_width, marker_height), 
overMarkerSize = new daum.maps.Size(over_marker_width, over_marker_height),
spriteImageSize = new daum.maps.Size(marker_width, marker_height);

function createMarkerImage(src, size){
   var markerImage = new daum.maps.MarkerImage(src, size);
   return markerImage;
}

var normalImage = createMarkerImage(sprite_marker_url, markerSize),
overImage = createMarkerImage(sprite_marker_url, overMarkerSize),
clickImage = createMarkerImage(click_marker_url, markerSize);


function addMarker(position, title, contentid, contenttypeid) {

   // 마커를 생성합니다
    var marker = new daum.maps.Marker({
     contentId: contentid,
      map : map, // 마커를 표시할 지도
      position : position, // 마커를 표시할 위치
      title : title, // 마커의 타이틀, 마커에 마우스를 올리면 타이틀이 표시됩니다
      image : normalImage
   // 마커 이미지 
   });

   //만약 arr에 존재하는 marker라면 빨간색 마커로 생성하겠다. 그리고 markerArr에 추가하겠다.
   if(arr.findIndex(function(item){return item.contentId === contentid})>-1){
      createArrMarkers(marker);
      
      if(markersArr.findIndex(function(item){return item.contentId === contentid})>-1){
         //markersArr에도 존재한다면?
         return false;
      }
   }
   
   // 마커 객체에 마커아이디와 마커의 기본 이미지를 추가합니다
   marker.normalImage = normalImage;
   
   markers.push(marker); //배열에 생성된 마커 추가
   //recPath.push(position); //추천 경로 배열에 좌표 추가


   //마커에 mouseover 이벤트 등록    
   daum.maps.event.addListener(marker, 'mouseover', function(){

      //클릭된 마커가 없고, mouseover된 마커가 클릭된 마커가 아니면 마커의 이미지를 오버 이미지로 변경
      if(!selectedMarker || selectedMarker != marker){
         if(arr.findIndex(function(item){return item.contentId === contentid})>-1){return false;}
         if($.inArray(marker, markersArr) != -1 ){return false;}
         marker.setImage(overImage);
      }
   });
   
   // 마커에 mouseout 이벤트를 등록합니다
   daum.maps.event.addListener(marker, 'mouseout', function() {

       // 클릭된 마커가 없고, mouseout된 마커가 클릭된 마커가 아니면 마커의 이미지를 기본 이미지로 변경합니다
       if (!selectedMarker || selectedMarker !== marker) {
         if($.inArray(marker, markersArr) != -1 ){return false;}
         if(arr.findIndex(function(item){return item.contentId === contentid})>-1){return false;}
           marker.setImage(normalImage);
       }
   });
   
   //선택한 마커를 생성하고 선택마커 배열에 추가하는 함수
   function createArrMarkers(marker){
         marker.setImage(clickImage);
         markersArr.push(marker);
         marker.setMap(map);
   }

   
 //마커 클릭시! 
   daum.maps.event.addListener(marker, 'click', function() {
         marker = this;
         //wrapWindowByMask();//팝업 레이어 검정 배경
         
       // 클릭된 마커가 없고, click 마커가 클릭된 마커가 아니면 마커의 이미지를 클릭 이미지로 변경합니다
       if (!selectedMarker || selectedMarker !== marker) {

           // 클릭된 마커 객체가 null이 아니면 클릭된 마커의 이미지를 기본 이미지로 변경하고
           //!!selectedMarker && selectedMarker.setImage(selectedMarker.normalImage);

           // 현재 클릭된 마커의 이미지는 클릭 이미지로 변경합니다
           marker.setImage(clickImage);
           
           //선택한 목록에 이미 존재한다면 삭제.
       }
       var i = arr.findIndex(function(item){return item.contentId === contentid});
       if(i > -1){
          //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!수정!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
          return false;
       }

      // 클릭된 마커를 현재 클릭된 마커 객체로 설정합니다
      selectedMarker = marker;
      var obj = new Object();
      obj.contentId = contentid;
      obj.contentTypeId = contenttypeid;
      obj.mapy = position.jb;
      obj.mapx = position.ib;
      obj.title = title;
      arr.push(obj);
      markersArr.push(this);
      
      var outputTitle = '<div class="pin" value="'+ contenttypeid + '" id="' + contentid + '" text-align:left>';
                     outputTitle += '<h4 class="title"><img src="resources/image/pathsidex.png" class= "xbtn" id="d' + contentid + '" onclick="deletePin(this)">' 
                              + "<a href='javascript:panTo(" + position.jb + ',' + position.ib + ',' + contentid + ',' + contenttypeid + ")'>"
                              + title + '</a></h4></div>';
      $('#path').append(outputTitle);
   });
   
}



//지도 위 표시되고 있는 마커 제거
function deleteMarker() {
   for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(null);
   }
   markers = [];
}

//지도 위 표시되고 있는 라인 제거
function deletePolyLine() {
   for (var i = 0; i < polylines.length; i++) {
      polylines[i].setMap(null);
   }
   polylines = [];
   //recPath = []; //라인 이어줄 좌표들 있는 배열 초기화
}

//지도 위 표시되고 있는 폴리곤 제거
function deletePolygon(polygons) {
   for (var i = 0; i < polygons.length; i++) {
      polygons[i].setMap(null);
   }
   polygons = [];
}

//팝업 레이어 닫기 버튼
function popupX() {
	var mask = document.getElementById("mask");
	var window = document.getElementById("window");
	mask.style.display = 'none';
	window.style.display = 'none';
}

 //팝업 레이어
function wrapWindowByMask() {

   // 뒤 검은 마스크를 클릭시에도 모두 제거하도록 처리합니다.
   $('#mask').click(function() {
      $(this).hide();
      $('#window').hide();
   });


   var maskHeight = $('#map').height();
   var maskWidth = $('#map').width(); //마스크의 높이와 너비를 화면 것으로 만들어 전체 화면을 채운다.

   $('#mask').css({
      'width' : maskWidth,
      'height' : maskHeight
   }); //마스크의 투명도 처리 
   $('#mask').fadeTo("slow", 0.8);

   var left = ($('#map').scrollLeft() + ($('#map').width() - $('#window')
         .width()) / 2);
   var top = ($('#map').scrollTop() + ($('#map').height() - $('#window')
         .height()) / 2);

   $('#window').css({
      'left' : left,
      'top' : top,
      'position' : 'absolute',
      'display' : 'inline'
   });

   $('#window').show();
}

var count = 0;

//경로 추천
function recommend() {
   if(sigungucode==''){
      alert("시군구를 입력해주세요.");
      return false;
   }
   $.ajax({
            url : 'getPath.do',
            type : 'get',
            dataType : 'json',
            data : {'sigungucode' : sigungucode, 'startTime' : $('#startTime').val(), 'weather' : weather},
            success : function(jsonData) {

               var path = jsonData.path;
               var time = jsonData.time;
               var sidePath = "";               //오른쪽 사이드바에 경로 나열
               recPath = [];                  //추천 경로가 담겨질 배열
               afterpath = [];
			   afterpath = [];
               count++;
               
               if(count > 1){                  //추천경로 클릭할 때마다 새로운 라인과 마커 생성
                  getpath();
                     return false;
               }
               for (var i = path.length - 1; i >= 0; i--) {
                  for (var j = 0; j < positions.length; j++) {
                     if (path[i] == (positions[j].contentid)) {
                         var obj = new Object();
                         obj.contentId = positions[j].contentid;
                         obj.contentTypeId = positions[j].contenttypeid;
                         obj.mapy = positions[j].latlng.jb;
                         obj.mapx = positions[j].latlng.ib;
                         obj.title = positions[j].title;
                         arr.push(obj);
                         afterpath.push(obj);
                         //arr.push(positions[j]);
                         
                        addMarker(positions[j].latlng,
                              positions[j].title,
                              positions[j].contentid,
                              positions[j].contenttypeid);
                              
                        sidePath += '<div class="pinn ' + positions[j].contentid + '" id="' + positions[j].contentid + '">';
                        sidePath += '<h4 class="title"><img src="resources/image/pathsidex.png" class= "xbtn" id="d' + positions[j].contentid + '"onclick="deletePin(this)">'
                        			 + "<li>" + time[i].substr(0,2) + ":" + time[i].substr(2,2) + "</li>"
                        			 + "<a href='javascript:panTo(" + positions[j].mapy + "," + positions[j].mapx + "," + positions[j].contentid + "," + positions[j].contenttypeid + ")'>"
                                  + positions[j].title + "</a>" + '</h4>';
                        sidePath += '</div>'; 

                        recPath.push(positions[j].latlng);

                     }
                  }
               }
               $('#pathlist').html(sidePath); //경로 목록 찍어줌
               
               drawLine(recPath);

            },
            error : function(XMLHttpRequest, textStatus, errorThrown) {
               alert("시간을 입력해주세요");  
            }
         });

}

//추천경로 구하기
function getpath(){
      if(arr.length < 3){
         alert("3개 이상의 장소를 입력하시오.");
         return false;
      }
      //마커 재배치
      if(afterSearchArr!=null){
         setMarkers(null);
         setMarkersArr(map);
         }
      $.ajaxSettings.traditional = true;
      $.ajax({
         url: 'getpath.do',
         type: 'POST',
         data: JSON.stringify(arr),
         dataType: 'json',
         contentType: 'application/json',
         success: function(data){
            $('#path').empty();
            //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!afterpath
            //var arra = new Array();
            //arra = data;
            markersArr = [];
            deletePolyLine();
            recPath = [];
            afterpath = [];
            afterpath = data;
            var sidePath = '';
            var bounds = new daum.maps.LatLngBounds();
               $.each(afterpath, function(i, val){

                  var latlng = new daum.maps.LatLng(val.mapy,val.mapx);

                  recPath.push(latlng);
                  bounds.extend(latlng);
                  addMarker(latlng, val.title, val.contentId, val.contentTypeId);
                  
                  sidePath += '<div class="pinn" id="' + val.contentId +  '"text-align:left>';
                  sidePath += '<h4 class="title"><img src="resources/image/pathsidex.png" class= "xbtn" id="' + val.contentId + '"onclick="deletePin(this)">'
                           + "<a href='javascript:panTo(" + val.mapy + "," + val.mapx +"," +  val.contentId + "," + val.contentTypeId + ")'>"
                           + val.title + "</a>" + '</h4>';
                  sidePath += '</div>';
               });
               
               drawLine(recPath);
               map.setBounds(bounds);
               $('#pathlist').empty();
               $('#pathlist').html(sidePath);
               }
      });
}


//클릭하면 해당 위치로 이동 (인포윈도우)
function panTo(mapy, mapx, contentid, contenttypeid) {

   // 이동할 위도 경도 위치를 생성합니다 
   var moveLatLon = new daum.maps.LatLng(mapy, mapx);

   // 지도 중심을 부드럽게 이동시킵니다
   // 만약 이동할 거리가 지도 화면보다 크면 부드러운 효과 없이 이동합니다
   map.panTo(moveLatLon);
   
   getDetail(contentid, contenttypeid);
}

//지도 검색
function searchMap(){
   if(polygons!=null){
      deletePolygon(polygons); 
   }
   var keyword = $('#searchMap').val();
   if(keyword == null){
      alert("검색어를 입력하세요.");
      return false;
   }
   if(afterSearchArr!=null){
   setMarkers(null);
   setMarkersArr(map);
   }
   $.ajax({
      url:'search.do',
      type: 'POST',
      data: {keyword:keyword},
      success: function(data){
         afterSearchArr = data;
         if(afterSearchArr.length==0){
            alert("검색 결과가 없습니다.");
            return false;
         }
         var bounds = new daum.maps.LatLngBounds();
         
         $.each(afterSearchArr, function(i, val){
            var latlng = new daum.maps.LatLng(val.mapY,val.mapX);
            bounds.extend(latlng);
            addMarker(latlng, val.title, val.contentId, val.contentTypeId);
         })
         map.setBounds(bounds);
         
         //keyword값 ''로
         $('#searchMap').val('');
      }
   })
}

function setMarkers(map){
    $.each(markers,function(i, val){
       val.setMap(map);
    })
}
   
function setMarkersArr(map){
   $.each(markersArr,function(i,val){
      val.setMap(map);
   })
}

//엔터로 검색
function enterkey(){
   if(window.event.keyCode == 13){
      searchMap();
   }
}

function drawLine(recPath){
   deletePolyLine();
   
   var polyline = new daum.maps.Polyline({
   path : recPath, // 선을 구성하는 좌표배열 입니다
   strokeWeight : 3, // 선의 두께 입니다
   strokeColor : '#db4040', // 선의 색깔입니다
   strokeOpacity : 1, // 선의 불투명도 입니다 1에서 0 사이의 값이며 0에 가까울수록 투명합니다
   strokeStyle : 'solid' // 선의 스타일입니다
   });
   
   polyline.setMap(map); //지도에 라인 추가
   polylines.push(polyline); //배열에 라인 담기 
}


//엑스표 누르면 arr와 div 삭제
function deletePin(event){
   var cid = (event.id).replace('d','');
   
   //arr에서 지우기
   var i = arr.findIndex(function(item){return item.contentId === cid});
   //이미지 노말로 바꾸기
   markersArr[i].setImage(normalImage);
   if(i > -1){//엑스표 누른게 arr배열에 있다면
      
      //arr에서 삭제
      arr.splice(i, 1);
      //markersArr에서 삭제
      markersArr.splice(i, 1);
        console.log(afterpath);
        console.log(cid);
      console.log(afterpath.findIndex(function(item){return item.contentId === cid}));
     if(afterpath.findIndex(function(item){return item.contentId === cid})>-1){
        //div 지우기 경로 전
       var top = document.getElementById('pathlist');
       var garbage = document.getElementById(cid);
       top.removeChild(garbage);
     }else{
          //div 지우기 경로 후
          var top1 = document.getElementById('path');
          var garbage1 = document.getElementById(cid);
          top1.removeChild(garbage1);
     }

   }   
   
   deletePolyLine();
}

//경로 새로고침
function newpath(){
   //마커지우기
   deleteMarker();
      
   //배열 다 비우기
   arr = new Array();
   markersArr = [];
   markers = [];
   count = 0;
   afterpath = [];
   //라인 지우기
   deletePolyLine();
   
   //div 지우기
   $('#path').empty();
   $('#pathlist').empty();
}


function getDetail(contentid, contenttypeid){
   wrapWindowByMask();
   var contentid = contentid;
   var contenttypeid = contenttypeid;
    $.ajax({        
        url: 'callDetail.do',
        type: 'get',
        data : {"contentId" : contentid, "contentTypeId" : contenttypeid},
        dataType: 'json',
        success: function(data){
            var addr = getInfo(contentid, contenttypeid);
           var myItem = data.response.body.items.item;
            var output = '<div class="pin1 ' + contentid + '" id="' + contentid + '" text-align:left>';
               output += '<div class="pin-top"><div id="title" style="background-image: url(\'' + 'resources/image/popup-top.png' + '\');"><font size="4em">' + addr.title + '</font><a id="popup-X" href="#" onclick="popupX()">';
               output += '<img src="resources/image/popup-X.png"></a></div></div>';
               output += '<div class="scope" ><img src = "' + addr.firstimage + '" style="height: 250px; width: 350px; float:left"/>';
            if(contenttypeid==39){
               output += '<p>네이버 플레이스 음식점 평점 : <div class="glyphicon glyphicon-star"/>' + addr.scope + '</p>';
            }
               if(addr.image1 && addr.link1){
                   output += '<p class="p">리뷰보기:(클릭으로 이동) </p><a class="review" href="' + addr.link1 + '"><img src="' + addr.image1 + '"/>'
                         + '</a>';
                }if(addr.image2 && addr.link2){
                   output += '<a class="review" href="' + addr.link2 + '"><img src="' + addr.image2 + '"/>'
                 + '</a>';
                }if(addr.image3 && addr.link3){
                   output += '<a class="review" href="' + addr.link3 + '"><img src="' + addr.image3 + '"/>'
                 + '</a>';
             	}
            
            output += '</div>';
            if(contenttypeid == 12){
                  if(myItem.parking){
                   output += '<p class="p" >'+'주차장 : ' + myItem.parking+'</p>';
                  }if(myItem.restdate){
                   output += '<p class="p" >' +'휴무일 : ' + myItem.restdate + '</p>';
                  }if(myItem.infocenter){
                   output += '<p class="p" >' +'연락처 : ' + myItem.infocenter + '</p>';
                  }
            }else if(contenttypeid == 14){
                  if(myItem.usefee){
                   output += '<p class="p" >'+'입장료 : ' + myItem.usefee+'</p>';
                  }if(myItem.usetimeculture){
                   output += '<p class="p" >'+'운영시간 : ' + myItem.usetimeculture+'</p>';
                  }if(myItem.restdateculture){
                   output += '<p class="p" >' +'휴무일 : ' + myItem.restdateculture + '</p>';
                  }if(myItem.infocenterculture){
                   output += '<p class="p" >' +'연락처 : ' + myItem.infocenterculture + '</p>';
                  }
            }else if(contenttypeid == 15){
                  if(myItem.eventplace){
                   output += '<p class="p" >'+'행사 장소 : ' + myItem.eventplace+'</p>';
                  }if(myItem.eventstartdate){
                   output += '<p class="p" >'+'행사 일정 : ' + myItem.eventstartdate + '~' + myItem.eventenddate +'</p>';
                  }if(myItem.playtime){
                   output += '<p class="p" >' +'행사 시간 : ' + myItem.playtime + '</p>';
                  }if(myItem.sponsor1 || myItem.sponsor1tel){
                   output += '<p class="p" >' +'주최처 : ' + myItem.sponsor1 + " tel) " + myItem.sponsor1tel + '</p>';
                  }
            }else if(contenttypeid == 28){
                  if(myItem.usetimeleports){
                   output += '<p class="p" >'+'운영시간 : ' + myItem.usetimeleports+'</p>';
                  }if(myItem.infocenterleports){
                   output += '<p class="p" >' +'연락처 : ' + myItem.infocenterleports + '</p>';
                  }
            }else if(contenttypeid == 32){
                  if(myItem.reservationurl){
                   output += '<p class="p" >'+'예약 : ' + myItem.reservationurl+'</p>';
                  }if(myItem.subfacility){
                   output += '<p class="p" >' +'시설 : ' + myItem.subfacility + '</p>';
                  }if(myItem.infocenterlodging){
                   output += '<p class="p" >' +'연락처 : ' + myItem.infocenterlodging + '</p>';
                  }
            }else if(contenttypeid == 38){
                  if(myItem.saleitem){
                   output += '<p class="p" >'+'취급물품 : ' + myItem.saleitem+'</p>';
                  }if(myItem.opentime){
                   output += '<p class="p" >'+'운영시간 : ' + myItem.opentime+'</p>';
                  }if(myItem.restdateshopping){
                   output += '<p class="p" >' +'휴무일 : ' + myItem.restdateshopping + '</p>';
                  }if(myItem.infocenter){
                   output += '<p class="p" >' +'연락처 : ' + myItem.infocenter + '</p>';
                  }
            }else if(contenttypeid == 39){
                  if(myItem.treatmenu){
                   output += '<p class="p" >'+'메뉴 : ' + myItem.treatmenu+'</p>';
                  }if(myItem.opentimefood){
                   output += '<p class="p" >'+'운영시간 : ' + myItem.opentimefood+'</p>';
                  }if(myItem.restdatefood){
                   output += '<p class="p" >' +'휴무일 : ' + myItem.restdatefood + '</p>';
                  }if(myItem.infocenterfood){
                   output += '<p class="p" >' +'연락처 : ' + myItem.infocenterfood + '</p>';
                  }
            }
            		output += '<p>사용자 별점 : ' + addr.star + '/<p>';
                output += '</div>';
                $('#window').html(output);
        },
      error: function(XMLHttpRequest, textStatus, errorThrown) { 
          alert("Status: " + textStatus); alert("Error: " + errorThrown); 
      } 
    });
}

function getInfo(contentid, contenttypeid){
   var addr;
   $.ajax({
      url:'callInfo.do',
      type:'POST',
      async: false, 
      data: {"contentId" : contentid, "contentTypeId" : contenttypeid},
      dataType: 'json',
      success: function(data){
         addr = data;
      }
      
   });
   return addr;
}

//행정구역 표시 텍스트
function AddText(position, text) {
    this.position = position;
    this.node = document.createElement('div');
    this.node.style.position = 'absolute';
    this.node.style.whiteSpace = 'nowrap';
    this.node.appendChild(document.createTextNode(text));
}

// "AbstractOverlay":#AbstractOverlay 상속. 프로토타입 체인을 연결한다..
AddText.prototype = new daum.maps.AbstractOverlay;

// 필수 구현 메소드.
// AbstractOverlay의 getPanels() 메소드로 MapPanel 객체를 가져오고
// 거기에서 오버레이 레이어를 얻어 생성자에서 만든 엘리먼트를 자식 노드로 넣어준다.
AddText.prototype.onAdd = function() {
    var panel = this.getPanels().overlayLayer;
    panel.appendChild(this.node);
};

// 필수 구현 메소드.
// 생성자에서 만든 엘리먼트를 오버레이 레이어에서 제거한다.
AddText.prototype.onRemove = function() {
    this.node.parentNode.removeChild(this.node);
};

// 필수 구현 메소드.
// 지도의 속성 값들이 변화할 때마다 호출된다. (zoom, center, mapType)
// 엘리먼트의 위치를 재조정 해 주어야 한다.
AddText.prototype.draw = function() {
    var projection = this.getProjection();
    var point = projection.pointFromCoords(this.position);
    var width = this.node.offsetWidth;
    var height = this.node.offsetHeight;

    this.node.style.left = (point.x - width/2) + "px";
    this.node.style.top = (point.y - height/2) + "px";

};

