window.addEventListener('load', 
  function() { 
	if (localStorage.getItem("sessiontoken") === null) {
	  window.location.href = "/login.html";
	} else {
		
	}
  }, false);