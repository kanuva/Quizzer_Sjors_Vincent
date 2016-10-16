var app = angular.module('quizzer', ['ngRoute', 'autofocus']);

var socket = io.connect(window.location.protocol + '//' + window.location.host);
