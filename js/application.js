/* based on PouchNotes by Tiffany Brown 
 * https://github.com/webinista/PouchNotes
 * LICENSE:
 * https://github.com/webinista/PouchNotes/blob/master/LICENSE
 * with modifications by Yvonne Aburrow
 * sync function from: https://github.com/manavmanocha/pouchnotes
 * (contributors Manav Manocha and Ramanjit Singh)
 */

var builddate, buildtime, buttonmenu, editbutton,
delbutton, hashchanger,
pn, PouchNotesObj, showview, svhandler, viewnotes, searchnotes;

viewnotes  = document.querySelector('[data-show="#allnotes"]');
buttonmenu = document.getElementById('buttonwrapper');
editbutton = document.querySelector('button[type=button].edit');
delbutton  = document.querySelector('button[type=button].delete');

showview = document.querySelectorAll('button.clicktarget');

/*=============================
Utility functions
===============================*/

PouchNotesObj = function (databasename, remoteorigin) {
    'use strict';

    Object.defineProperty(this, 'pdb', {writable: true});
    Object.defineProperty(this, 'remote', {writable: true});
    Object.defineProperty(this, 'formobject', {writable: true});
    Object.defineProperty(this, 'notetable', {writable: true});
 	Object.defineProperty(this, 'searchformobject', {writable: true});
 	Object.defineProperty(this, 'errordialog', {writable: true});
    Object.defineProperty(this, 'dbname', {writable: true});

	var databasename = 'pouchnotes';
	var remoteorigin = 'https://your-ip-address:6984'; /* default server port for https is 6984 */
	var hostUrl = 'https://your-app-id.appspot.com/';
	/* please note you will need a SSL certificate in order to get data to sync */
	
    this.dbname = databasename;
    this.pdb = new PouchDB(databasename);
    this.remote = new PouchDB(remoteorigin + '/pouchnotes');
	
//from https://github.com/pouchdb-community/pouchdb-authentication/issues/121	   
	var user = {
	  name: '',
	  password: ''
	};
	// non-admin user can read & write to the database 
	// source: http://blog.mattwoodward.com/2012/03/definitive-guide-to-couchdb.html
	var pouchOpts = {
	  skipSetup: true
	};
	var ajaxOpts = {
	  ajax: {
		headers: {
		  Authorization: 'Basic ' + window.btoa(user.name + ':' + user.password),
		  'Access-Control-Allow-Origin' : hostUrl,
		  'Access-Control-Allow-Methods': 'GET, DELETE, PUT, OPTIONS',
		  'Access-Control-Allow-Credentials': true,
		  'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With'
		}
	  }
	};
	
	this.remote.login(user.name, user.password, ajaxOpts, function (err, response) {
	  if (err) {
		if (err.name === 'unauthorized' || err.name === 'forbidden') {
		  console.log('Unauthorised user');
		} else {
		  //return this.remote.allDocs();
		  console.log('Successful login');
		}
	  }
	});

	
    var opts = {live: true};
    this.pdb.replicate.to(this.remote, opts);
    this.pdb.replicate.from(this.remote, opts);

};


PouchNotesObj.prototype.buildtime = function(timestamp){
    var ts = new Date(+timestamp), time = [], pm, ampm;

    pm = (ts.getHours() > 12);

    time[0] = pm ? ts.getHours() - 12 : ts.getHours();
    time[1] = ('0'+ts.getMinutes()).substr(-2);

    if( time[0] == 12 ){
    	ampm = 'pm';
    } else {
    	ampm = pm ? 'pm' : 'am';
    }

    return ' @ '+time.join(':') + ampm ;
}

PouchNotesObj.prototype.builddate = function (timestamp) {
    var d = [], date = new Date(timestamp);

    d[0] = date.getFullYear();
    d[1] = ('0'+(date.getMonth() + 1)).substr(-2);
    d[2] = ('0'+date.getDate()).substr(-2);
    return d.join('-');
}


/***********
Create a function to log errors to the console for
development.
************/

PouchNotesObj.prototype.reporter = function (error, response) {
    'use strict';
    if (console !== undefined) {
        if (error) { console.log(error); }
        if (response) { console.log(response); }
    }
};

PouchNotesObj.prototype.showerror = function (error) {
    var o, txt, msg = this.errordialog.getElementsByClassName('msg')[0];
    for(o in error){
    	txt = document.createTextNode(error[o]);
    	msg.appendChild(txt);
    }
    this.errordialog.toggleClass('hide');
};

PouchNotesObj.prototype.show = function (selector) {
    'use strict';
    var els = document.querySelectorAll(selector);
    Array.prototype.map.call(els, function (el) {
        el.classList.remove('hide');
    });
};
PouchNotesObj.prototype.hide = function (selector) {
    'use strict';
    var els = document.querySelectorAll(selector);
    Array.prototype.map.call(els, function (el) {
		el.classList.add('hide');
    });
	document.getElementById('login').classList.remove('hide');
};
PouchNotesObj.prototype.resethash = function () {
    window.location.hash = '';
}

PouchNotesObj.prototype.savenote = function () {
    'use strict';
    var o = {}, that = this;

    /*
    If we have an _id, use it. Otherwise, create a timestamp
    for to use as an ID. IDs must be strings, so convert with `+ ''`
    */
    if (!this.formobject._id.value) {
        o._id = new Date().getTime() + '';
    } else {
        o._id = this.formobject._id.value;
    }

    if (this.formobject._rev.value) {
        o._rev = this.formobject._rev.value;
    }

    /*
    Build the object based on whether the field has a value.
    This is a benefit of a schema-free object store type of
    database. We don't need to include values for every property.
    */

   // o.notetitle = (this.formobject.notetitle.value == '') ? 'Untitled Note' : this.formobject.notetitle.value;
   // o.note      = (this.formobject.note.value == '') ? '' : this.formobject.note.value;
   // o.tags      = (this.formobject.tags.value == '') ? '' : this.formobject.tags.value;
    o.name      = (this.formobject.name.value == '') ? '' : this.formobject.name.value;
    o.jobtitle  = (this.formobject.jobtitle.value == '') ? '' : this.formobject.jobtitle.value;
    o.level      = (this.formobject.name.level == '') ? '' : this.formobject.level.value;
    o.mobile1      = (this.formobject.mobile1.value == '') ? '' : this.formobject.mobile1.value;
    o.mobile2      = (this.formobject.mobile2.value == '') ? '' : this.formobject.mobile2.value;
    o.home      = (this.formobject.home.value == '') ? '' : this.formobject.home.value;
    o.work      = (this.formobject.work.value == '') ? '' : this.formobject.work.value;
    o.campus      = (this.formobject.campus.value == '') ? '' : this.formobject.campus.value;
    o.building      = (this.formobject.building.value == '') ? '' : this.formobject.building.value;
    o.room      = (this.formobject.room.value == '') ? '' : this.formobject.room.value;
    o.home_email      = (this.formobject.home_email.value == '') ? '' : this.formobject.home_email.value;
    o.work_email      = (this.formobject.work_email.value == '') ? '' : this.formobject.work_email.value;
	var selectedPref = document.querySelector('input[name="preferred"]:checked').value;
    o.preferred      = (selectedPref == '') ? '' : selectedPref;
	var selectedAppAccess = document.querySelector('input[name="application_access"]:checked').value;
    o.application_access      = (selectedAppAccess == '') ? '' : selectedAppAccess;
    o.modified  = new Date().getTime();

    this.pdb.put(o, function (error, response) {
        if(error){
            that.showerror(error);
        }

        if(response && response.ok){
     		if(that.formobject.attachment.files.length){
				var reader = new FileReader();

				/*
				Using a closure so that we can extract the
				File's data in the function.
				*/
				reader.onload = (function(file){
					return function(e) {
						that.pdb.putAttachment(response.id, file.name, response.rev, e.target.result, file.type);
					}
				})(that.formobject.attachment.files.item(0));

				reader.readAsDataURL(that.formobject.attachment.files.item(0));
			}

           	that.viewnoteset();
        	that.formobject.reset();

        	that.show(that.formobject.dataset.show);
           	that.hide(that.formobject.dataset.hide);

           	viewnotes.dispatchEvent(new MouseEvent('click'));
		}
    });

 	this.resethash();
};

PouchNotesObj.prototype.viewnote = function (noteid) {
    'use strict';

    var that = this, noteform = this.formobject;

    this.pdb.get(noteid, {attachments:true}, function (error, response) {
        var fields = Object.keys(response), o, link, attachments, li;

    	if (error) {
           	this.showerror();
            return;
        } else {

        	fields.map( function (f) {
				if (noteform[f] !== undefined && noteform[f].type != 'file' ) {
					noteform[f].value = response[f];
				} /* else {
					 var key = noteform[f].name;
					 var val = response[f];
					  if ( noteform[f].name == key && noteform[f].value == val ) {
						noteform[f].setAttribute('checked', 'checked');
					  }
				} */
				if (f == '_attachments') {
					attachments = response[f];
					for (o in attachments) {
						li = document.createElement('li');
						link = document.createElement('a');
						link.href = 'data:' + attachments[o].content_type + ';base64,' + attachments[o].data;
						link.target = "_blank";
						link.appendChild(document.createTextNode(o));
						li.appendChild(link);
					}
					document.getElementById('attachmentlist').appendChild(li);

				}
			})

            // fill in form fields with response data.
            that.show('#addnote');
            that.hide('section:not(#addnote)');
            that.show('#attachments');
        }
    });

 	if (window.location.hash.indexOf(/view/) > -1 ) {
        // disable form fields
        noteform.classList.add('disabled');

        Array.prototype.map.call( noteform.querySelectorAll('input, textarea'), function(i){

			switch (i.type)
			{
				case "hidden":
				//do nothing
					break;
			   case "email":
				   i.classList.add('hide');
				   break;
			   case "tel":
				   i.classList.add('hide');
				   break;

			   default:
					i.disabled = 'disabled';
			}
        });

		setTimeout(loadInteractives, 1000);
	}
}

PouchNotesObj.prototype.deletenote = function (noteid) {
	var that = this;
	/* IDs must be a string */

 	this.pdb.get(noteid+'', function (error, doc) {
		that.pdb.remove(doc, function (e, r) {
        	if(e){
        		that.showerror();
        	} else {
        		viewnotes.dispatchEvent(new MouseEvent('click'));
        	}
    	});
    });
}

/*
TO DO: refactor so we can reuse this function.
*/
PouchNotesObj.prototype.viewnoteset = function (start, end) {
    var i,
    that = this,
    df = document.createDocumentFragment(),
    options = {},
    row,
    nl = this.notetable.querySelector('tbody');

    options.include_docs = true;

    if(start){ options.startkey = start; }
    if(end){ options.endkey = end; }

    this.pdb.allDocs(options, function (error, response) {
    	/*
    	What's `this` changes when a function is called
    	with map. That's why we're passing `that`.
    	*/
        row = response.rows.map(that.addrow, that);
        row.map(function(f){
        	if (f) {
            	df.appendChild(f);
            }
        });

        i = nl.childNodes.length;
		while(i--){
			nl.removeChild(nl.childNodes.item(i));
		}

        nl.appendChild(df);
    });

    this.resethash();
}

PouchNotesObj.prototype.addrow = function (obj) {
    var tr, td, a, o, created;

    a  = document.createElement('a');
    tr = document.createElement('tr');
    td = document.createElement('td');

    a.href = '#/view/'+obj.id;
/*     a.innerHTML = obj.doc.name + ' (' + obj.doc.level + '), ' + obj.doc.jobtitle === undefined ? 'No name' : obj.doc.name + ' (' + obj.doc.level + '), ' + obj.doc.jobtitle + ' [<span class="access" id="'+obj.doc.home_email+'" rel="'+obj.doc.work_email+'">' + obj.doc.application_access +'</span>]' ; */
	a.innerHTML = obj.doc.name  === undefined ? 'No name' : obj.doc.name ;

    td.appendChild(a);
    tr.appendChild(td);

 /*    created = td.cloneNode(false);
    created.innerHTML = this.builddate(+obj.id) + this.buildtime(+obj.id);

    updated = created.cloneNode();
    updated.innerHTML = obj.doc.modified ? this.builddate(+obj.doc.modified) + this.buildtime(+obj.doc.modified) : this.builddate(+obj.id) + this.buildtime(+obj.id);

    tr.appendChild(created);
    tr.appendChild(updated); */

	jobtitle = td.cloneNode(false);
	jobtitle.innerHTML = obj.doc.jobtitle === undefined ? '-' : obj.doc.jobtitle;
	level  = td.cloneNode(false);
	level.innerHTML = obj.doc.level === undefined ? '-' : obj.doc.level;
	access = td.cloneNode(false);
	if(obj.doc.home_email == '') {
		home_email = 'none';
	} else {
		home_email = obj.doc.home_email;
	}
	if(obj.doc.work_email == '') {
		work_email = 'none';
	} else {
		work_email = obj.doc.work_email;
	}
	access.innerHTML = '<span class="access" title="' + obj.doc.application_access +'" id="'+obj.doc.home_email+'" rel="'+obj.doc.work_email+'">' + obj.doc.application_access +'</span>' === undefined ? '-' : '<span class="access" id="'+home_email+'" rel="'+work_email+'">' + obj.doc.application_access +'</span>';

	tr.appendChild(level);
	tr.appendChild(jobtitle);
	tr.appendChild(access);

    return tr;
}


PouchNotesObj.prototype.search = function(searchkey) {
	var that = this;

	var map = function(doc) {
		/*
		Need to do grab the value directly because
		there isn't a way to pass it any other way.
		*/

		var searchkey,regex;
		searchkey = document.getElementById('q').value.replace(/[$-\/?[-^{|}]/g, '\\$&');
		regex = new RegExp(searchkey,'i');

		if( regex.test(doc.name) || regex.test(doc.level) || regex.test(doc.jobtitle) || regex.test(doc.campus) ){
			emit(doc._id, {name: doc.name, jobtitle: doc.jobtitle, level: doc.level, mobile1: doc.mobile1, mobile2: doc.mobile2, home: doc.home, work: doc.work, home_email: doc.home_email, work_email: doc.work_email, campus: doc.campus, building: doc.building, room: doc.room, preferred: doc.preferred, application_access: doc.application_access, id: doc._id, modified: doc.modified});
		}
	}

  	this.pdb.query(map, function(error, response) {
  		if(error){ console.log(error); }
  		if(response){
	 		var df, rows, nl, results;

	 		results = response.rows.map(function(r){
  				r.doc = r.value;
  				delete r.value;
  				return r;
  			});
  			nl = that.notetable.getElementsByTagName('tbody')[0];
  			df = document.createDocumentFragment(),
  			rows = results.map(that.addrow, that);
  			rows.map(function(f){
        		if (f) {
            		df.appendChild(f);
            	}
        	});
        	nl.innerHTML = '';
        	nl.appendChild(df);
  		}
  	});
}

/* sync function by Manav Manocha */

/* 
TO DO: sync notes.
*/
PouchNotesObj.prototype.syncnoteset = function (start, end) {
    var start = new Date().getTime();
    document.getElementById("syncbutton").innerHTML = "Syncing...";
    
    var i, 
    that = this, 
    
    options = { 
    doc_ids:['1450853987668']   
  };
     
        
    //options.include_docs = true;
    
    if(start){ options.startkey = start; }
    if(end){ options.endkey = end; }
   
    PouchDB.sync(this.dbname, this.remote, { retry: true })
    //this.pdb.sync(this.remote, { doc_id:['1450853987668'] })
    .on('change', function (info) {
       console.log('change');
		document.getElementById("syncbutton").innerHTML = "Sync Contacts";
    }).on('paused', function () {
       console.log('replication paused (e.g. user went offline)');
		document.getElementById("syncbutton").innerHTML = "Sync Contacts";
    }).on('active', function () {
       console.log('replicate resumed (e.g. user went back online)');
		document.getElementById("syncbutton").innerHTML = "Sync Contacts";
    }).on('denied', function (info) {
       console.log('a document failed to replicate, e.g. due to permissions');
		document.getElementById("syncbutton").innerHTML = "Sync Contacts";
    }).on('complete', function (info) {
      console.log("Sync Complete");
      document.getElementById("syncbutton").innerHTML = "Sync Contacts";
      that.viewnoteset();
      that.formobject.reset();    
      that.show(that.formobject.dataset.show);
      that.hide(that.formobject.dataset.hide);
      var end = new Date().getTime();
      console.log("Time Taken - " + (end - start) + " ms");
    }).on('error', function (error) {
      console.log("Sync Error:" + JSON.stringify(error));  
      alert("Sync Error:" + error);
      that.showerror(error);
    });   
    
}

PouchNotesObj.prototype.resetpouchdb = function (start, end) {
    document.getElementById("loadingImage").style.display = "block";
    var start = new Date().getTime();
    var that = this;
           
   
    this.pdb.destroy().then(function() {
        that.pdb = new PouchDB(that.dbname);
        document.getElementById("loadingImage").style.display = "none";        
         var end = new Date().getTime();
         console.log("Time Taken to resetpouchdb- " + (end - start) + " ms");
        that.formobject.reset();
        that.notetable.getElementsByTagName('tbody')[0].innerHTML='';
        that.show(that.formobject.dataset.show);
        that.hide(that.formobject.dataset.hide);
    });      
    
}

/*------ Maybe do in a try-catch ? ------*/


try {
    pn = new PouchNotesObj('pouchnotes');
}
catch(err) {
    console.log('pn = new PouchNotesObj ERROR: ' + err.message);
}

pn.formobject = document.getElementById('noteform');
pn.notetable  = document.getElementById('notelist');
pn.searchformobject  = document.getElementById('searchnotes');
pn.errordialog  = document.getElementById('errordialog');


/* SEARCH */

pn.searchformobject.addEventListener('submit', function (e) {
   'use strict';
    e.preventDefault();
    pn.search();
});

pn.formobject.addEventListener('submit', function (e) {
    e.preventDefault();
    pn.savenote();
});

pn.formobject.addEventListener('reset', function (e) {
    var disableds = document.querySelectorAll('#noteform [disabled]');
    e.target.classList.remove('disabled');
	/* YA TODO: add switch statement on type - if email or tel, hide clickable phone/email and display input */
    Array.prototype.map.call(disableds, function(o){
        o.removeAttribute('disabled');
		if(o.classList.contains('hide')) {
			o.classList.remove('hide');
		}
    });

	var interactive = document.getElementsByClassName('interactive');
	for (var c=0, len=interactive.length; c<len; c++){
		interactive[c].classList.remove('hide');
	}
    pn.hide('#attachments');
    document.getElementById('attachmentlist').innerHTML = '';
});

window.addEventListener('hashchange', function (e) {
    var noteid;
    if(window.location.hash.replace(/#/,'') ){
        noteid = window.location.hash.match(/\d/g).join('');
        pn.viewnote(noteid);
    }
});

svhandler = function (evt) {
	var attchlist = document.getElementById('attachmentlist');

    if (evt.target.dataset.show) {
        pn.show(evt.target.dataset.show);
    }
    if (evt.target.dataset.hide) {
        pn.hide(evt.target.dataset.hide);
    }

    if (evt.target.dataset.action) {
        pn[evt.target.dataset.action]();
    }

    if (evt.target.dataset.show === '#addnote') {
        pn.formobject.reset();
		var interactive = document.getElementsByClassName('interactive');
		for (var c=0, len=interactive.length; c<len; c++){
			interactive[c].classList.add('hide');
			interactive[c].setAttribute('href', '');
			interactive[c].innerHTML = '';
		}
        pn.show(evt.target.dataset.show);
		pn.formobject.classList.remove('disabled');
		var formFields = pn.formobject.getElementsByTagName('input');
		for (var d=0, len=formFields.length; d<len; d++){
			formFields[d].classList.remove('hide');
		}

        /* Force reset on hidden fields. */
        pn.formobject._id.value = '';
        pn.formobject._rev.value = '';
    }

	//buttonmenu.classList.remove('hide');
	pn.hide('#attachments');
    attchlist.innerHTML = '';
    pn.searchformobject.reset();
    pn.resethash();
};

/* TO DO: Refactor these click actions to make the functions reusable */

editbutton.addEventListener('click', function (e) {
    pn.formobject.classList.remove('disabled');
	/* add switch statement on type - if email or tel, hide clickable phone/email and display input */

     Array.prototype.map.call( pn.formobject.querySelectorAll('input, textarea'), function(i){
		if (i.type !== 'hidden') {
			i.removeAttribute('disabled');
			i.classList.remove('hide');
		}
	});
	var interactive = document.getElementsByClassName('interactive');
	for (var c=0, len=interactive.length; c<len; c++){
		interactive[c].classList.add('hide');
	}
});

delbutton.addEventListener('click', function (e) {
    pn.deletenote(+e.target.form._id.value);
});

Array.prototype.map.call(showview, function (ct) {
    ct.addEventListener('click', svhandler);
});

Array.prototype.map.call(document.getElementsByClassName('dialog'), function (d) {
    d.addEventListener('click', function(evt){
        if(evt.target.dataset.action === 'close'){
            d.classList.add('hide');
        };
    });
});

window.addEventListener('DOMContentLoaded', function(event){
    viewnotes.dispatchEvent(new MouseEvent('click'));
});

pn.formobject.addEventListener('change', function(event){
	if(event.target.type === 'file'){
		var fn = event.target.value.split('\\');
		document.querySelector('.filelist').innerHTML = fn.pop();
	}
});

function loadInteractives() {
	/* add switch statement on type - if email or tel, hide and display clickable phone/email */
	var interactives = document.getElementsByClassName('interactive');
	for (var c=0, len=interactives.length; c<len; c++){
		input = interactives[c].previousSibling;
		iType = input.getAttribute("type");
		switch (iType)
		{
		   case "email":
			   var emailAddress = input.value;
			   interactives[c].innerHTML = emailAddress;
			   interactives[c].setAttribute("href","mailto:" + emailAddress);
			   //interactives[c].setAttribute("class","mailto");
			   break;
		   case "tel":
			   var phoneNumber = input.value;
			   interactives[c].innerHTML = phoneNumber;
			   interactives[c].setAttribute("href","tel:" + phoneNumber);
			   break;

		   default:
			   //do nothing
		}
		inputId = input.getAttribute("id");
		switch (inputId)
		{
		   case "home_email":
			   var home_email = input.value;
			   break;
		   case "work_email":
			   var work_email = input.value;
			   break;

		   default:
			   //do nothing
		}
	}
	restrictEditing(work_email,home_email);
}

/** editing permissions **/

/** IF logged_in_user == doc.work_email OR doc.application_access == 'Admin',
 show edit / delete buttons ELSE hide edit / delete buttons (div#buttonwrapper) **/

 function restrictEditing(work_email,home_email) {
	var logged_in_user = document.getElementById('loggedinuser').getAttribute('rel');
	if(logged_in_user == work_email || logged_in_user == home_email || logged_in_user == 'yourteam@company.name') {
		buttonmenu.classList.remove('hide');
	} else {
		if(!(buttonmenu.classList.contains('hide'))) {
			buttonmenu.classList.add('hide');
		}
	}
	var userStatus = document.getElementById('user_status').getAttribute('rel');
	if(userStatus == 'Admin') {
		buttonmenu.classList.remove('hide');
	}
 }

