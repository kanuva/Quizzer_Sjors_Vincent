var app = angular.module('quizzer', ['ngRoute']);

var socket = io.connect(window.location.protocol + '//' + window.location.host);
