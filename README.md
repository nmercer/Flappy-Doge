wow
===

such coin

    very space

  much codin


elastic stalk group deploy
--------------------------

### setup env vars in .bash_profile

optional, can give crednetials in init step
see [elastic beanstalk gettin' rearin' to go guide](http://docs.aws.amazon.com/elasticbeanstalk/latest/dg/usingCLI.html)

* create credential file w/ AWSAccessKeyId/AWSSecretKey for AWS access (e.g. ~/.aws-such-credentials)
* set AWS_CREDENTIAL_FILE + ELASTICBEANSTALK_URL

### install elastic tools etc.

see [elastic beanstalk node.js blah blah](http://docs.aws.amazon.com/elasticbeanstalk/latest/dg/create_deploy_nodejs_express.html)

* install node
* install npm
* download the ```eb``` command line tools
* initialization deatils described in the next step
* so...you can ignore the rest of the getting started shit

### init elastic stalk to point at dev server

* run ```eb init``` in the project
* provide credentials or use defaults sourced from ```AWS_CREDENTIAL_FILE```
* select ```US East``` service region or use default sourced in ```ELASTICBEANSTALK_URL```
* use existing application name: ```dogeinspace```
* use existing environment name: ```dogeinspace-env```
* use environment tier: ```WebServer::Standard::1.0```
* use solution stack ```32bit Amazon Linux 2013.09 running Node.js```
* use environment type ```SingleInstance```
* do **NOT** create a new RDS DB Instance (select **n**o)
* you may not have permission to attach an instance profile, just proceed without attaching an instance profile (**y**es)

### useful shit

* eb status - get info on the server...should return like
```
URL   : XXXXXXX.elasticbeanstalk.com
Status    : Ready
Health    : Green

RDS Database: XXXXX
```
* eb stop/start - start or stop the running instance
* git aws.push - the big one, writes git changes up to AWS

# MOR COMMENT

use wow such txt in MAYBE CAPS

