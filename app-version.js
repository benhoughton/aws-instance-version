var AWS = require('aws-sdk');
var async = require('async');
var wget = require('wget');
AWS.config.region = 'eu-west-1';

exports.version = function(event, context, callback){

    console.log("hello");

    var autoScaling = new AWS.AutoScaling();

    async.waterfall([

        getAutoScalingGroups,
        getInstances,
        describeInstances,
        getInstanceVersion
    ], function (err, result) {
        if (err) {
            console.log(err, err.stack);
        }
        else{
            console.log(result);
        }
    });

};

function getAutoScalingGroups(callback){
    console.log("getAutoScalingGroups");

    var autoScaling = new AWS.AutoScaling();
    autoScaling.describeAutoScalingGroups(callback);
}

function getInstances(data, callback){
    console.log("getInstances");

    var instanceIds = new Array();

    for (var i = 0; i < data.AutoScalingGroups.length; i++) {
        var asg = data.AutoScalingGroups[i];
        for (var j = 0; j < asg.Instances.length; j++) {
            var instanceId = asg.Instances[j].InstanceId;
            instanceIds.push(instanceId);
        }
    }

    callback(null,instanceIds);
}

function describeInstances(data, callback){
    console.log("describeInstances");

    var ec2 = new AWS.EC2();

    var params = {  InstanceIds: data };

    ec2.describeInstances(params, callback)
}

function getInstanceVersion(data) {

    console.log("getInstanceVersion");

    for (var i = 0; i < data.Reservations.length; i++) {
        var ipAddress = data.Reservations[i].Instances[0].PrivateIpAddress;

        var options = {
            protocol: 'http',
            host: ipAddress,
            path: '/version',
            method: 'GET'
        };
        
        wget.request(options, function(res) {
            console.log(res);
        });
    }
}
