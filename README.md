## PouchContacts

PouchContacts is based on **PouchNotes** by [Tiffany Brown @webinista](https://github.com/webinista)

See her [SitePoint.com article](http://www.sitepoint.com/building-offline-first-app-pouchdb/) on Building a Note Taking Application with PouchDB.

Sync function by [Manav Manocha @manavmanocha](https://github.com/manavmanocha/pouchnotes)

[Licensed under Apache License Version 2.0, January 2004](https://github.com/vogelbeere/pouchcontacts/blob/master/LICENSE)

[Enable CORS function by Bauwe Bijl]((https://github.com/BauweBijl/gaecors))

### Purpose

The purpose of this app is to be able to edit contacts in PouchDB on your local device and sync them with CouchDB on a remote server (this app is set up for Google App Engine).

#### Hints and tips
(aka things I wish I had known when I started)

- [how to log in to CouchDB on Google App Engine](https://stackoverflow.com/questions/47474384/couchdb-login-access-on-google-app-engine)
- [how to access Fauxton on Google App Engine](https://stackoverflow.com/questions/47349446/how-do-i-access-fauxton-on-the-google-appengine-platform)
- **Port 6984 for https connections**: If you want to [access the API via https, the port is 6984](https://cwiki.apache.org/confluence/pages/viewpage.action?pageId=48203146) (not 5984), and for a non-Google App Engine server, you need something like [Nginx set up to provide a SSL certificate](https://cwiki.apache.org/confluence/display/COUCHDB/Nginx+as+a+proxy). On Google App Engine, SSL certificates are provided.
- **5984 for http connections**
- Remember to [enable CORS](https://github.com/BauweBijl/gaecors)
- Make sure you have [configured the firewall correctly](https://docs.bitnami.com/google/faq/#how-to-open-the-server-ports-for-remote-access).
- you only need SSH tunnelling to access Fauxton on localhost. You don't need it to access the API.
- [configure CouchDB to enable SSL](https://docs.bitnami.com/virtual-machine/infrastructure/couchdb/#how-to-enable-ssl-for-https-on-couchdb).

[Thanks to the guys at the CouchDB user mailing list for their input](https://mail-archives.apache.org/mod_mbox/couchdb-user/201711.mbox/browser)
