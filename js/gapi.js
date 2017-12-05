
      // Enter an API key from the Google API Console:
      //   https://console.developers.google.com/apis/credentials
      var apiKey = 'AIzaSyCdOe-tSnnbQvdTeG16z6ajyfl5qkTV7_U';
      // Enter the API Discovery Docs that describes the APIs you want to
      // access. In this example, we are accessing the People API, so we load
      // Discovery Doc found here: https://developers.google.com/people/api/rest/
      var discoveryDocs = ["https://people.googleapis.com/$discovery/rest?version=v1"];
      // Enter a client ID for a web application from the Google API Console:
         https://console.developers.google.com/apis/credentials?project=brookes-critical-incidents
      // In your API Console project, add a JavaScript origin that corresponds
      //   to the domain where you will be running the script.
      var clientId = '824515690907-50r8ah1av2kt1e4tfieollqaehu66qf0.apps.googleusercontent.com';
      // Enter one or more authorization scopes. Refer to the documentation for
      // the API or https://developers.google.com/people/v1/how-tos/authorizing
      // for details.
      var scopes = 'https://www.googleapis.com/auth/cloud-platform';
      var authorizeButton = document.getElementById('authorize-button');
      var signoutButton = document.getElementById('signout-button');
      var mainDiv = document.getElementById('main');
      var editNav = document.getElementById('edit');
      function handleClientLoad() {
        // Load the API client and auth2 library
        gapi.load('client:auth2', initClient);
      }
      function initClient() {
        gapi.client.init({
            apiKey: apiKey,
            discoveryDocs: discoveryDocs,
            clientId: clientId,
            scope: scopes
        }).then(function () {
          // Listen for sign-in state changes.
          gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
          // Handle the initial sign-in state.
          updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
          authorizeButton.onclick = handleAuthClick;
          signoutButton.onclick = handleSignoutClick;
        });
      }
      function updateSigninStatus(isSignedIn) {
        if (isSignedIn) {
          authorizeButton.style.display = 'none';
          signoutButton.style.display = 'inline-block';
		  mainDiv.style.display = 'block';
		  editNav.style.display = 'block';
          makeApiCall();
        } else {
          authorizeButton.style.display = 'inline-block';
          signoutButton.style.display = 'none';
		  mainDiv.style.display = 'none';
		  editNav.style.display = 'none';
        }
      }
      function handleAuthClick(event) {
        gapi.auth2.getAuthInstance().signIn();
      }
      function handleSignoutClick(event) {
        gapi.auth2.getAuthInstance().signOut();
		var loggedin = document.getElementById("loggedinuser");
		loggedin.parentNode.removeChild(loggedin);
		var userStatus = document.getElementById("user_status");
		userStatus.parentNode.removeChild(userStatus);
      }
      // Load the API and make an API call.  Display the results on the screen.
      function makeApiCall() {
        gapi.client.people.people.get({
          'resourceName': 'people/me',
          'requestMask.includeField': 'person.names,person.emailAddresses'
        }).then(function(resp) {
			//console.log(resp.result);
			var name = resp.result.names[0].givenName;
			var email = resp.result.emailAddresses[0].value;
			authorizeButton.insertAdjacentHTML('beforebegin', '<span id="loggedinuser" rel="' + email + '">Logged in as ' + name + '</span>');
			var permittedUsers = ['its-mobiledev@brookes.ac.uk'];
			if(email == 'its-mobiledev@brookes.ac.uk') {
				signoutButton.insertAdjacentHTML('beforebegin', '<span id="user_status" rel="Admin">[Admin]</span>');
			} 
			var accessLevels = document.getElementsByClassName('access');
			for (var c=0, len=accessLevels.length; c<len; c++){
				permittedUsers.push(accessLevels[c].getAttribute('rel'),accessLevels[c].getAttribute('id'));
				var status = accessLevels[c].childNodes[0].textContent;
				if(status == 'Admin' && (accessLevels[c].getAttribute('rel') == email || accessLevels[c].getAttribute('id') == email)) {
					signoutButton.insertAdjacentHTML('beforebegin', '<span id="user_status" rel="Admin">[Admin]</span>');
				} 
			}
			if(permittedUsers.includes(email)) {
				//do nothing
			} else {
				mainDiv.style.display = 'none';
				editNav.style.display = 'none';
				mainDiv.insertAdjacentHTML('beforebegin', '<p id="unauthorised">You are not authorised to view this page.</p>');
				setTimeout(function(){
					authorizeButton.style.display = 'none';
					signoutButton.style.display = 'inline-block';
					var notAuth = document.getElementById("unauthorised");
					unauthorised.parentNode.removeChild(unauthorised);
					signoutButton.click();
				}, 1000);
			}
        });
      } 