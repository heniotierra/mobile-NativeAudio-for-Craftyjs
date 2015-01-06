Crafty.extend({
    audio: {
	_playing: [],
	_readyToPlay: [],
        add: function (id, url) {
            if (!Crafty.support.audio)
                return;
	    var that = this;
	    if (id.indexOf("§") !== -1) {
                console.log("audio.add: PRELOAD COMPLEX " + url);
		window.plugins.NativeAudio.preloadComplex( id, url, 1, 1, function(msg){
		    	that._readyToPlay.push(id);
		  }, function(msg){
		      if(msg == "OK")
			  that._readyToPlay.push(id);
		      console.log( 'error: ' + msg );
		  });
	    } else {
                console.log("audio.add: PRELOAD SIMPLE " + url);
		window.plugins.NativeAudio.preloadSimple( id, url, function(msg){
		    	that._readyToPlay.push(id);
		  }, function(msg){
		      if(msg == "OK")
			  that._readyToPlay.push(id);
		      console.log( 'error: ' + msg );
		  });
            }
        },
        play: function (id, repeat, volume) {
	    var eFrames = 0;
	    if (repeat === -1){
		if(this._readyToPlay.indexOf(id) !== -1)
		    window.plugins.NativeAudio.loop(id);
		else
		    Crafty.bind("EnterFrame", function wait_for_looping(){
			if(Crafty.audio._readyToPlay.indexOf(id) !== -1){
			    window.plugins.NativeAudio.loop(id);
			    Crafty.unbind("EnterFrame", wait_for_looping);
			}
			eFrames++;
			if(eFrames >= Crafty.timer.FPS()){
			    Crafty.unbind("EnterFrame", wait_for_looping);
			    console.log("wait_for_looping timed out");
			}
		    });
	    } else {
		if(this._readyToPlay.indexOf(id) !== -1)
		    window.plugins.NativeAudio.play(id, function(){}, function(){}, function(){ Crafty.audio._removeFromPlaying(id); });
		else
		    Crafty.bind("EnterFrame", function wait_for_playing(){
			if(Crafty.audio._readyToPlay.indexOf(id) !== -1){
			    window.plugins.NativeAudio.play(id, function(){}, function(){}, function(){ Crafty.audio._removeFromPlaying(id); });
			    Crafty.unbind("EnterFrame", wait_for_playing);
			}
			eFrames++;
			if(eFrames >= Crafty.timer.FPS()){
			    Crafty.unbind("EnterFrame", wait_for_playing);
			    console.log("wait_for_playing timed out");
                        }
		    });
            }
            if (typeof volume !== "undefined" && volume !== 1 && id.indexOf("§") !== -1)
                this.changeVolume(id, volume);
	    if(this._playing.indexOf(id) === -1)
		this._playing.push(id);
        },
	_removeFromPlaying: function(id){
	    Crafty.audio._playing.splice(Crafty.audio._playing.indexOf(id), 1);
	},
	_removeFromReadyToPlay: function(id){
	    Crafty.audio._readyToPlay.splice(Crafty.audio._readyToPlay.indexOf(id), 1);
	},
        remove: function (id) {
            window.plugins.NativeAudio.unload(id);
	    Crafty.audio._removeFromPlaying(id);
	    Crafty.audio._removeFromReadyToPlay(id)
        },
	stop: function (id) {
	    if (typeof id === "string") {
		for(var p in this._playing){
		    if(this._playing[p] == id) {
                        window.plugins.NativeAudio.stop(this._playing[p]);
		   	this._removeFromPlaying(id);
			return;
		    }
		}
	    } else {
		for(var p in this._playing){
		    this.stop(this._playing[p]);
		}
            }
        },
	changeVolume: function (id, volume) {
	    window.plugins.setVolumeForComplexAsset( id, volume, function(msg){
		  }, function(msg){
		      console.log( 'error: ' + msg );
		  })
	}
    }
});
