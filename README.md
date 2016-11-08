The OpenShift `nodejs` cartridge documentation can be found at:

http://openshift.github.io/documentation/oo_cartridge_guide.html#nodejs



the DB is located in https://mlab.com/
To access it need to be created a new user in database with name and password.

To access DB I used mongoose
http://mongoosejs.com/

Dont need to install MongoDB :)

example of routs:
http://pptest-kwiatchris.rhcloud.com/bars/findall
/bars/add/:name

http://pptest-kwiatchris.rhcloud.com/bars/findwithradius/:lat/:long/:radian
where :lat and :long is the location point and :radian is a radius ( range ) in meters to look for all point in this range

