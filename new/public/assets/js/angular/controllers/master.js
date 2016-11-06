app.controller('MasterController', function ($scope, $rootScope, $window, $location, $route, $http) {

    $scope.questions = [];
    $scope.answers = [];

    // Category validation vars
    $scope.checked = 0;
    $scope.limit = 3;

    $scope.currentGame = {
        currentQuestion: "You have not selected a question (yet)..",
        roundNumber: 0,
        roundStarted: false
    };

    $scope.givenAnswers = "There are no answers given (yet).."; //hier zouden we een array of object van moeten maken

    // Category validation vars
    $scope.checked = 0;
    $scope.limit = 3;

    /*
     ===================================================================================================================
     Server socket
     ===================================================================================================================
     */
    socket.on('serverReboot', function () {
        $rootScope.$apply(function () {
            $location.path('/');
            $route.reload();
        });
    });
    /*
     ===================================================================================================================
     Actions
     ===================================================================================================================
     */

    // Create room
    $scope.create_room = function () {

        console.info('created the room: ' + $scope.room);

        socket.emit('master_create', {
            room: $scope.room,
            master: socket.id
        });

    };

    // Accept team
    $scope.accept_team = function (team) {
        console.log('accepting team: ' + team.name);

        socket.emit('master_accept_team', {
            team: team.name,
            master: socket.id,
            room: $route.current.params.room
        });
    };

    // Accept team
    $scope.decline_team = function (team) {
        console.log('declining team: ' + team.name);

        socket.emit('master_decline_team', {
            team: team.name,
            master: socket.id,
            room: $route.current.params.room
        });
    };

    // Select the categories, has choosen the teams
    $scope.select_categories = function () {
        socket.emit('master_category', {
            room: $route.current.params.password,
            master: socket.id
        });

    };

    // Select the categories, has choosen the teams
    $scope.start_game = function () {
        var checked_categories = [];

        angular.forEach($scope.categories, function (value, key) {
            if (value.checked === true) {
                checked_categories.push(value.name);
            }
        });

        socket.emit('start_game', {
            room: $route.current.params.password,
            categories: checked_categories,
            master: socket.id
        });

    };




    // Category checked
    $scope.checkChanged = function (category) {
        if (category.checked) $scope.checked++;
        else $scope.checked--;
    };


    $scope.categories = [];
    $scope.getCategories = function () {
        $http.get('/categories')
            .success(function (data) {

                data.forEach(function (category, key) {
                    $scope.categories.push({name: category, checked: false});
                });

            });
    };

    $scope.dashboard_init = function () {
        $scope.dashboard = true;

        $http.get('/game/' + $route.current.params.password + '/teams')
            .success(function(data) {

                data.teams.forEach(function(team, key) {
                    $scope.teams.push(team);
                });

                data.categories.forEach(function(category, key) {
                    $scope.categories.push(category);
                });

                $http.get('/questions/' + $scope.categories[0] + '/' + $scope.categories[1] + '/' + $scope.categories[2])
                    .success(function(data) {

                        data.forEach(function(question, key) {

                                $scope.questions.push({
                                    question : question.question,
                                    answer : question.answer,
                                    category : question.category,
                                    id: question._id,
                                    class: ''
                                });

                        });

                });
            });
    };

    $scope.select_question = function(id) {
        for(var i=0; i < $scope.questions.length; i++) {

            if($scope.questions[i].class == 'selected') {
                $scope.questions[i].class = '';
            }

            if($scope.questions[i].id == id) {
                $scope.questions[i].class = 'selected';
                $scope.currentGame.currentQuestion = $scope.questions[i].question;
            }
        }
    };

    $scope.start_Round = function() {
        $scope.currentGame.roundStarted = true;
        $scope.currentGame.roundNumber ++;

        for(var i=0; i < $scope.questions.length; i++) {

            if($scope.questions[i].question == $scope.currentGame.currentQuestion) {
                $scope.questions.splice(i, 1);
            }

        }

        // copy answers
        var answers = [];
        angular.copy($scope.answers, answers);

        angular.forEach($scope.teams, function(team, key) {

            answers.forEach(function(answer, keytwo) {
                if(answer.answered == 'correct' && team.name == answer.team) {
                    $scope.teams[key].score += 1;
                }
            });

        });



        if($scope.answers) {
            if ($scope.answers.length > 0) {
                $scope.answers = [];
            }
        }

        socket.emit('sentQuestion', {
            question: $scope.currentGame.currentQuestion,
            masterId: socket.id,
            answers: answers
        });

    };

    $scope.end_Round = function () {
        $scope.currentGame.roundStarted = false;
        socket.emit('round_Ended', {
            masterId: socket.id
        })
    };

    $scope.correct_answer = function(answer_obj) {
        console.log('answered the question of team: '+ answer_obj.team + ' as correct...');

        for(var i=0; i < $scope.answers.length; i++) {
            if($scope.answers[i].team == answer_obj.team) {
                $scope.answers[i].answered = 'correct';
            }
        }
    };

    $scope.wrong_answer = function(answer_obj) {
        console.log('answered the question of team: '+ answer_obj.team + ' as wrong...');

        $scope.answers.forEach(function(answer, key) {
            if(answer.team == answer_obj.team) {
                $scope.answers[key].answered = 'wrong';
            }
        });
    };



    /*
     ===================================================================================================================
     Socket Listeners
     ===================================================================================================================
     */

    // Room created, redirect to accepting teams
    socket.on('master_created', function (data) {

        $location.path('/master/' + data.room + '/teams');
        $scope.$apply();

    });

    // Room exists, give error message
    socket.on('master_exists', function (data) {

        $rootScope.$apply(function () {
            $scope.error = "The room already exists, please a different roomname";
        });

    });

    $scope.teams = [];
    // Team is joining
    socket.on('team_joined', function (data) {

        console.log('team wants to join...');
        $rootScope.$apply(function () {

            $scope.teams.push({name: data.team, accepted: false});

        });
    });


    // Team is accepted
    socket.on('master_team_accepted', function (data) {

        $rootScope.$apply(function () {
            angular.forEach($scope.teams, function (team, key) {
                if (team.name === data.team) {
                    $scope.teams[key].accepted = true;
                }
            });
        });

    });

    // Team is declined
    socket.on('master_team_declined', function (data) {

        $rootScope.$apply(function () {
            angular.forEach($scope.teams, function (team, key) {
                if (team.name === data.team) {
                    $scope.teams[key].accepted = 'declined';
                }
            });
        });

    });


    socket.on('master_to_categories', function (data) {
        $location.path('/master/' + data.room + '/categories');
        $scope.$apply();
    });

    socket.on('master_game_started', function (data) {
        $location.path('/master/' + data.room + '/dashboard');
        $scope.$apply();
    });

    socket.on('question_Answer', function(data){
        console.log("ik heb een antwoord binnen gekregen");

        $scope.answers.push({ team: data.team, answer: data.answer, answered: false });
        $scope.$apply();

    });
}); // End of MasterController
