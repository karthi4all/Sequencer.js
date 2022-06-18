/*
 Author : M.Karthi
 Email: karthi4all@gmail.com
 
 Description:
 To help avoid async chaining, who some dont like,
 and remove complexity of chaining or other complicated models.
 
 The library allows to execute serial of activities using fire mechanism.
 
 
 
 var s=Sequencer.getSequence("user-registration");
 
 
 s.addStage({name: "stage1", times: 1, number: 1, callback: function () {
 Sequencer.getSequence("user-registration").stageThrough("stage1");  //fire mechanism
 return null;
 }});
 
 s.addStage({name: "stage2", times: 1, number: 2, callback: function () {
 Sequencer.getSequence("user-registration").stageThrough("stage2"); //fire mechanism
 return null;
 }});
 
 s.start();

Todo:
1. stage through throw exception if stage not found
2. stage override may require warning
3. may be change number to stageNumber
4. times may take 1 time as default
5. auto increment stagenumber


Advanced feature:
stage graphign

 */

(function (ref) {
    var Sequencer = function () {
        var self = this;
        self.initialized = false;

        var Sequence = function (name) {
            var self = this;
            self.waitTime = 200;
            var _lock = false;

            var SequenceStage = function (options) {
                var self = this;
                self.name = options.name;
                self.number = options.number;
                self.repeat = options.times;
                self.callback = options.callback;
                self._timeExecuted = 0;

                self.execute = function () {
                    if (!_lock) {
                        _lock = true;
                        if (self.repeat === -1) {
                            self._timeExecuted++;
                            console.log("executing:" + self.name)
                            self.callback();
                            //todo
                        } else {
                            if (self._timeExecuted < self.repeat) {
                                self._timeExecuted++;
                                console.log("executing:" + self.name)
                                self.callback();
                            }
                        }
                        _lock = false;
                    }

                }
            };

            self.name = name;
            self._stages = new Array();
            self._currentStage = null;
            self._running = false;
            self.addStage = function (stageName, repeatTimesTillFailure, stageNumber, callback) {
                var _stage = new SequenceStage(stageName, repeatTimesTillFailure, stageNumber, callback);
                self._stages.push(_stage);
            };

            //@todo locks required for mutual exclusion
            self._getStage = function (stageName) {
                for (var i = 0; i < self._stages.length; i++) {
                    var s = self._stages[i];
                    if (s.name === stageName) {
                        return s;
                    }
                }
            }

            self._monitorStage = function () { //future: might have minor issue
                if (self._running)
                    if (self._currentStage) {
                        self._currentStage.execute();
                    }
            };

            self.nextStageOf = function (stageName) {
                var list = new Array();
                var stage = self._getStage(stageName);
                for (var i = 0; i < self._stages.length; i++) {
                    var s = self._stages[i];
                    if (s.number > stage.number) {
                        list.push(s.number);
                    }
                }
                var targetStageNumber;
                if (list.length > 0) {
                    list.sort();
                    targetStageNumber = list[0];

                    for (var j = 0; j < self._stages.length; j++) {
                        var s = self._stages[j];
                        if (s.number === targetStageNumber) {
                            return s;
                        }
                    }
                }
                return null;
            };

            self.stageThrough = function (stageName) {
                if (self._currentStage.name === stageName) {
                    var nextStage = self.nextStageOf(self._currentStage.name);
                    //        console.log("Next Stage selected:")
                    //      console.log(nextStage)
                    self._currentStage = nextStage;
                }
            };

            self._getFirstStage = function () {
                var list = new Array();
                for (var i = 0; i < self._stages.length; i++) {
                    var s = self._stages[i];
                    list.push(s.number);
                }
                var targetStageNumber;
                if (list.length > 0) {
                    list.sort();
                    targetStageNumber = list[0];

                    for (var j = 0; j < self._stages.length; j++) {
                        var s = self._stages[j]
                        if (s.number === targetStageNumber) {
                            return s;
                        }
                    }
                }
                return null;
            }

            self.start = function () {
                self._currentStage = self._getFirstStage();
                self._running = true;
            }

            self.stop = function () {
                self._running = false;
            }

            setInterval(function () {
                self._monitorStage();
            }, self.waitTime);
        }



        self._sequences = new Array();

        self.getSequence = function (sequenceName) {
            for (var i = 0; i < self._sequences.length; i++) {
                var s = self._sequences[i];
                if (s.name === sequenceName) {
                    return s;
                }
            }
            var s = new Sequence(sequenceName);
            self._sequences.push(s);
            return s;
        };

        self.removeSequence = function (sequenceName) {
            for (var i = 0; i < self._sequences.length; i++) {
                var s = self._sequences[i];
                if (s.name === sequenceName) {
                    self._sequences.remove(i);
                }
            }
        };


        self._initialize = function () {
            self.initialized = true;
        }

        self._initialize();

    }

    ref.Sequencer = new Sequencer();
}(this));
