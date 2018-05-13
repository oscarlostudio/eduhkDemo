
app.controller("courseCtrl", function($scope,$rootScope,user,$firebaseArray,$window) {

		/*initialzation and checking*/
		var courses = firebase.database().ref("courses");
		$scope.courseFB=$firebaseArray(courses);
		
		var userAccount = firebase.database().ref("UserAccount");
		$scope.userAccount = $firebaseArray(userAccount);
		
		$scope.ckey="";
		$scope.activeChoice="0";
		const TYPE_NEW_POST = "0";
		const TYPE_READ_POST = "1";
		const TEXT_NEW_POST = "#newPost";
		const TEXT_READ_POST = "#readPost";
		const SUMMERNOTE_ID_CREATE ="#summernoteCreate" ;
		const SUMMERNOTE_ID_REPLY ="#summernoteReply" ;
		$scope.ready=false;
		$scope.discussionFB=[];
		$scope.postList=[];
		$scope.replyList = [];
		$scope.postTitle="";
		$scope.postStatus = TYPE_NEW_POST
		const DEFAULT_COVER_PIC="image/grey.png";
		$scope.newPostContent={};
		$scope.fileName="";
		$scope.currentPostId ="";
		const TIME_FORMAT = "MMMM Do YYYY, h:mm:ss a";
		$scope.materialFB=[];
		$scope.materialList=[];
		$scope.newExercise={};
		var QUESTION_TEMPLATE = {"question":"","0":"","1":"","2":"","3":""};
		$scope.exerciseList=[];
		$scope.exerciseFB=[];
		$scope.currExercise={};
		$scope.currAnswer={};
		

		
		$scope.doRedirect=function(href)
		{
			$window.location.href=href;
		}
		
				
		$scope.updateRole=function()
		{
			$scope.email=user.email;
			$scope.role=user.role;
			$scope.userName=user.userName;
			$scope.key=user.key;
			$scope.course=user.course;
		}
	
		$scope.currCourse={};		
		$scope.ckey;
		
		$rootScope.$on("updateRole", function(){
			$scope.updateRole();
			$scope.loadcoursesInfo();	
			$scope.resetNewPostContent();
		});
		
		
		$scope.loadingExerciseAnswer=function(exerciseId,studentId)
		{
			var exercise;
			
			for(var i=0; i<$scope.exerciseList.length;i++)
			{
				if(exerciseId==$scope.exerciseList[i].id)
				{
					 exercise = $scope.exerciseList[i].data;
					 break;
				}
			}
			
			for(var key in exercise.student)
			{
				if(exercise.student[key].id==studentId)
				{
					 answer = exercise.student[key].answer;
					 break;
				}
			}

			for(var i =0;i<exercise.question.length;i++)
			{
				exercise.question[i].choice=answer[i];
			}
			console.log("exercise",exercise);

			$scope.currAnswer=exercise;
			$scope.$apply();
		
			
		}
		
		$scope.submitNewExeciseContent=function()
		{
			$scope.newExercise.title=$("#exerciseTitle").val();
			
			for(var i=0;i<$scope.newExercise.question.length;i++)
			{
				$scope.newExercise.question[i]["0"]=$("#question"+i).find(".choiceA").val();
				$scope.newExercise.question[i]["1"]=$("#question"+i).find(".choiceB").val();
				$scope.newExercise.question[i]["2"]=$("#question"+i).find(".choiceC").val();
				$scope.newExercise.question[i]["3"]=$("#question"+i).find(".choiceD").val();
				$scope.newExercise.question[i]["question"]=$("#question"+i).find("textarea").val();
				$scope.newExercise.question[i]["corr"]=$("#question"+i).find('input[name=question'+i+']:checked').val();
				
			}
			var isValid = $scope.isExerciseValid();
			if(isValid)
			{
				var ref = firebase.database().ref('/exercises/'+$scope.ckey);
				var exercise=angular.copy($scope.newExercise)
				ref.push(exercise);
				$('.close').click();
			}
			else
			{
				alert("some data missing");
			}
			
		}
		
		$scope.resetNewExerciseContent=function()
		{
			$scope.newExercise={"title":"","question":[QUESTION_TEMPLATE],"student":[]}
			$('textarea').val('');
			$('input').val('');
		}
		$scope.addQuestion=function()
		{
			$scope.newExercise.question.push({"question":"","0":"","1":"","2":"","3":""});
		}
		$scope.isExerciseValid=function()
		{
			if($scope.newExercise.title.trim()=="")
			{
				return false;
			}
			for(var i =0; i < $scope.newExercise.question.length;i++)
			{
				var question = $scope.newExercise.question[i];
				if(question.question.trim()==""||question["0"].trim()==""||question["1"].trim()==""||question["2"].trim()==""
				||question["3"].trim()==""||!question["corr"])
				{
					return false;
				}
			}
			
			return true;
		}
		
		$scope.resetNewPostContent=function()
		{
			$scope.newPostContent={"title":"","image":DEFAULT_COVER_PIC,"owner":$scope.email,"reply":[]};
		}
		
		$scope.loadDiscussion=function()
		{
			if(!$scope.discussionFB)
				return;
			$scope.postList=[];
			for(var i=0;i<$scope.discussionFB.length;i++)
			{
				var post=$scope.discussionFB[i].data;
				var authorName = $scope.getNameByMail(post.owner);
				var time = moment(post.createdTime,"").fromNow();
				var tmp={"id":$scope.discussionFB[i].id,"title":post.title,"image":post.image,"author":authorName,"time":time};
				$scope.postList.push(tmp);
			}
			$scope.$apply();
		}
		
		$scope.loadMaterial=function()
		{
			if(!$scope.materialFB)
				return;
			$scope.materialList=[];
			$scope.materialList=$scope.materialFB;
			$scope.$apply();
		}
		
		$scope.initMaterial=function()
		{
			firebase.database().ref("materials/"+$scope.ckey).once('value', function(data) 
			{
				var tmpArray=[];
				var obj = data.val();
				for(var key in obj)
				{
					tmpArray.push({"id":key,"data":obj[key]});
				}
				$scope.materialFB = tmpArray;
				$scope.loadMaterial();				
			});	
			
		}
		
		$scope.activeExecise=function(key)
		{
			for(var i =0;i<$scope.exerciseList.length;i++)
			{
				if(key==$scope.exerciseList[i].id)
				{
					$scope.currExercise = $scope.exerciseList[i];
					$scope.$apply();
					break;
				}
			}		
		}
		
		$scope.submitExercise=function()
		{
			var exerciseObj={};
			var answer=[];
			var isValid=true;
			for(var i=0;i<$scope.currExercise.data.question.length;i++)
			{
				var tmp=$("#EXquestion"+i).find('input[name=EXquestion'+i+']:checked').val();
				console.log("tmp",tmp);
				if(!tmp)
				{
					isValid =false;
					break;
				}
				else
				{
					answer.push(tmp);
				}
			}
			
			if(isValid)
			{
				exerciseObj={"id":user.email,"answer":answer};
				var ref = firebase.database().ref('/exercises/'+$scope.ckey+'/'+$scope.currExercise.id+'/student');
				ref.push(exerciseObj);
				$('.close').click();
				$scope.initExercise();
				
				
			}
			else
			{
				alert("Please complete all the quetsions!")
			}
			
		}
		
		$scope.loadExercise=function()
		{
			if(!$scope.exerciseFB)
				return;
			$scope.exerciseList=[];
			$scope.exerciseList=$scope.exerciseFB;
			for(var key in $scope.exerciseList)
			{
				var obj = $scope.exerciseList[key].data;
				if(obj.student)
				{

					obj.submitted=false;
					for(var k in obj.student)
					{
						if(obj.student[k].id==user.email)
						{
							obj.submitted=true;
							break;
						} 	
					}
					
				}
				else
				{
					obj.submitted=false;
				}

			}

			$scope.$apply();
		}
	
		$scope.initExercise=function()
		{
			firebase.database().ref("exercises/"+$scope.ckey).once('value', function(data) {	
				var tmpArray=[];
				var obj = data.val();
				for(var key in obj)
				{
					tmpArray.push({"id":key,"data":obj[key]});
				}
				$scope.exerciseFB = tmpArray;
				$scope.loadExercise();		
			});			
		}

		$scope.initDiscussion=function()
		{
			firebase.database().ref("discussions/"+$scope.ckey).once('value', function(data) {
	
				var tmpArray=[];
				var obj = data.val();
				for(var key in obj)
				{
					tmpArray.push({"id":key,"data":obj[key]});
				}
				tmpArray.sort((a,b)=> new Date(b.data.createdTime) - new Date(a.data.createdTime));
				$scope.discussionFB = tmpArray;
								
				$scope.loadDiscussion();		
			});			
		}
		
		$scope.loadcoursesInfo=function()
		{
			$scope.ready = false;
			$scope.ckey=$scope.gup('c', window.location.href);
			
			if($scope.ckey==null||$scope.ckey==""||$scope.pathStringCheck())
			{
				$scope.doRedirect("index.html");		
			}
			else
			{
				firebase.database().ref("courses/"+$scope.ckey).once('value', function(data) {
					if(data.val()==null)
					{
						console.log("invalid input of course id");
						$scope.doRedirect("index.html");
					}
					else
					{
						$scope.currCourse=data.val();
						$scope.currCourse.key=data.getKey();
						$scope.courseInfo.image=$scope.currCourse.image;
						$scope.ready = true;
						$scope.initDiscussion();
						$scope.initMaterial();		
						$scope.initExercise();						
					}
				});

			}

		}
		$scope.getReplysByPostId=function(postId)
		{
			$scope.currentPostId = postId;
			firebase.database().ref("discussions/"+$scope.ckey).once('value', function(data) {
				var tmp = data.val();	
				if(tmp[postId]&&tmp[postId].reply)
				{
					$scope.replyList=tmp[postId].reply;
					$scope.postTitle = tmp[postId].title;
					console.log("posttitle",$scope.postTitle);
					$scope.$apply();
				}
				else
					$scope.replyList = null;
			});	
			
		}
		
		
		$scope.readPost=function(postId)
		{
			$scope.postStatus = TYPE_READ_POST;	
			$scope.getReplysByPostId(postId);
		}
		
		$scope.back=function()
		{
			$scope.postStatus = TYPE_NEW_POST;
			$scope.postTitle = "";
			$scope.$apply();
		}

		$scope.createPost=function()
		{
			var div = $scope.getSummeNoteId();
			var content =  $(div).summernote('code');
			var title = $('.createPostTitle').val();
			var isValid = $scope.isCreatePostValid(title, content);			
			if(isValid)
			{
				var time=moment().format(TIME_FORMAT);
				var createdTime=moment().format();
				var tmp={"author":$scope.email,"content":content,"time":time};
				$scope.newPostContent.reply.push(tmp);
				$scope.newPostContent.title = title;
				$scope.newPostContent.createdTime = createdTime;				
				var ref = firebase.database().ref('/discussions/'+$scope.ckey);
				ref.push($scope.newPostContent);
				$scope.initDiscussion();
				$('.close').click();
				
			}
			else
			{
				alert("Some data missing!");
				return;
			}			
		}
		
		$scope.replyPost=function()
		{
			var div = $scope.getSummeNoteId();
			var content =  $(div).summernote('code');
			console.log("reply post content",content);
			var isValid = $scope.isReplyPostValid(content);	
			if(isValid)
			{
				var time=moment().format(TIME_FORMAT);
				var tmp={"author":$scope.email,"content":content,"time":time};
				
				var ref = firebase.database().ref('/discussions/'+$scope.ckey+'/'+$scope.currentPostId+'/reply');
				ref.push(tmp);
				$scope.getReplysByPostId($scope.currentPostId);
				$('.close').click();
				
			}
			else
			{
				alert("Some data missing!");
				return;
			}				
			
		}
		
		
		
		/**********************************common function**************************************************************/
		$scope.closeModal=function()
		{
			$('.close').click();
		}
		
		$scope.renderUserName = function(e) {
			return $scope.getNameByMail(e);
		}
		
		$scope.renderTime = function(e) {
			return moment(e, TIME_FORMAT).fromNow();
		}
		$scope.isReplyPostValid=function(content)
		{
			if(content.trim()=="")
			{
				return false;
			}				
			else
			{
				return true;
			}
		}
		
		$scope.isCreatePostValid=function(title,content)
		{
			if(title.trim()==""|| content.trim()=="")
			{
				return false;
			}				
			else
			{
				return true;
			}
		}
		$scope.getNameByMail=function(mail)
		{
			for (var i=0;i<$scope.userAccount.length;i++)
			{
				var obj = $scope.userAccount[i];
				if(obj.email==mail)
					return obj.userName;
			}
			return "Unknown";
		}
		
		$scope.gup=function( name, url ) {
			if (!url) url = location.href;
			name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
			var regexS = "[\\?&]"+name+"=([^&#]*)";
			var regex = new RegExp( regexS );
			var results = regex.exec( url );
			return results == null ? null : results[1];
		}
		$scope.pathStringCheck=function()
		{
			var invalidSet=['.','#','$','[',']'];
			for(i=0;i<invalidSet.length;i++)
			{
				if($scope.ckey.indexOf(invalidSet[i])>-1)
				{
					return true;
				}
			}
			return false;
		}
		
		$scope.changeActive=function(choice)
		{
			$scope.activeChoice=choice;
		}
		
		$scope.initSummernote=function()
		{
			var div=$scope.getSummeNoteId();
			$(div).summernote({
				tabsize: 2,
				height: 200,
				toolbar: [
					// [groupName, [list of button]]
					['style', ['bold', 'italic', 'underline', 'clear']],
					['font', ['strikethrough', 'superscript', 'subscript']],
					['fontsize', ['fontsize']],
					['color', ['color']],
					['para', ['ul', 'ol', 'paragraph']],
					['height', ['height']]
				]
			});
			$(div).summernote('reset');
			$('.createPostTitle').val('');
		}
	

		
		File.prototype.convertToBase64 = function(callback){		//function of  convert uploaded image to base64 image
			var reader = new FileReader();
			reader.onload = function(e) {
				 callback(e.target.result)
			};
			reader.onerror = function(e) {
				 callback(null);
			};        
			reader.readAsDataURL(this);
		};
		
		$scope.fileNameChanged = function (ele) // trigger when user upload a file
		{
		  var file = ele.files[0];
		  if(file.type.length>0&&file.type.substr(0,5)=="image")  // check for the format type of the chose file
		  {
				file.convertToBase64(function(base64)
				{
					$scope.newPostContent.image=base64;
					$scope.fileName=file.name;
					$('.previewContainer').show();
					$('#base64PicURL').attr('src',base64);
					$('#base64Name').html(file.name);
					$('#profilePic').val('');	
				}); 		  	  
		  }
		  else
		  {
			  alert("invliad file format");
			  $scope.removeImg();
			  $('#profilePic').val('');
		  }

		}
		
		$scope.removeImg=function(){ //function for remove the uploaded image
		
			
			
			$scope.newPostContent.image=DEFAULT_COVER_PIC;
			$scope.fileName='';
			$('#base64PicURL').attr('src','');
			$('#base64Name').html('');
			$('.previewContainer').hide();

		}
		$scope.getSummeNoteId=function()
		{
			if($scope.postStatus == TYPE_NEW_POST)
			{
				return SUMMERNOTE_ID_CREATE;
			}
			else
			{
				return SUMMERNOTE_ID_REPLY;
			}
		}
		
		/**********************************teacher update info********************************************************/
		
				

		
		$scope.courseInfo=
		{
			title:"",
			image:"",
			owner:"",
			name:"",
			introduction:""
		}


		
});

app.filter('trustAsHtml',['$sce', function($sce) {

  return function(text) {

    return $sce.trustAsHtml(text);

  };

}]);
