/*
	Copyright 2011 - Vito Tafuni
	This file is part of JSOTTEST.

    JSOTTEST is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    JSOTTEST is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with JSOTTEST.  If not, see <http://www.gnu.org/licenses/>.
*/


/*
	Base Operational Transformation Object
*/
var myOT = function(options){
	var history = []; // chronological ops history
	var readyQueue = []; 
	var waitingQueue = [];
	var busy = false;
	var _this = this;

	
	this.execOps = [];
	this.usr = options.usr;
	this.opToLocal = options.opToLocal || function(){};
	this.opToRemote = options.opToRemote || function(){};
	this.log = options.log || function(){};

	// local reveived operations endpoint
	this.opFromLocal = function(op){
		readyQueue.push(function(){ 
			busy = true;
			_this.mngOpFromLocal(op); 			
			busy = false;
			op = null;
			_this.flushQueue();
		});
		this.flushQueue();
	}

	// remote received operations endpoint
	this.opFromRemote = function(op){
		readyQueue.push(function(){ 
			busy = true;
			_this.mngOpFromRemote(op);
			busy = false;
			op = null;
			_this.flushQueue();
		});
		this.flushQueue();
	}
	
	/*
		transformation control algorithm for local operations
	*/
	this.mngOpFromLocal = function(op){
		//XXX temporary solution for local undo: a better analisys is needed!!
		var last_op = this.lastOp();
		if(last_op!=null && op.isOlder(last_op)){
			var sc=0;
			for (; sc<history.length && !op.similarContext(history[sc]); sc++);		
			this.log('>> transforming',op.toString());
			for (var i=sc; i< history.length; i++) {
				// check if each previous operation context needs to be corrected
				var op_curr = history[i];
				this.log('\t>> correction to',op_curr.toString());
				for (var t=i+1; t<history.length && !op_curr.identicalContext(op); t++){
					var op_corr = history[t];
					this.transform(op_curr, op_corr);
				}
				this.log('\t<<');

				if(op.usr != op_curr.usr)
					this.transform(op,op_curr);
			}
			this.log('<<');
		}
		
		history.push(op);
		this.execOps.push(op.toString());
		
		// ready operations are executed immediately
		this.opToRemote(op);
	}
	
	/*
		transformation control algorithm for remote operations
	*/
	this.mngOpFromRemote = function(op){
		// transform remote operations
		var sc=0;
		for (; sc<history.length && !op.similarContext(history[sc]); sc++);		
		this.log('>> transforming',op.toString());
		for (var i=sc; i< history.length; i++) {
			// check if each previous operation context needs to be corrected
			var op_curr = history[i];
			this.log('\t>> correction to',op_curr.toString());
			for (var t=i+1; t<history.length && !op_curr.identicalContext(op); t++){
				var op_corr = history[t];
				this.transform(op_curr, op_corr);
			}
			this.log('\t<<');

			if(op.usr != op_curr.usr)
				this.transform(op,op_curr);
		}
		this.log('<<');
	
		history.push(op);
		this.execOps.push(op.toString());
	
		this.opToLocal(op);
	}
	
	this.flushQueue = function(){
		if(!busy){
			var qop = readyQueue.shift();
			if(qop) 
				qop();
		}
	}

	this.reset = function(){
		history = [];
		readyQueue = [];
		this.execOps = [];
		busy = false;
	}
	
	this.lastOp = function(){
		return (history.length>0)? history[history.length-1]:null;
	}
}
/*
	transform: transformation function
*/
myOT.prototype.transform = function(op1,op2){
	op11 = op1.toString();
	/*
		If op1 and op2 have the same context they could be transformed with each other without problem.
		If op1 has a lower value for the context of op2 then op1 needs to be transformed against op2.
		If op1 has a bigger value for the context of op2 then op1 already know about op2 and don't need to be transformed.
	*/
	if( op1.getContextFor(op2.usr)>op2.getContextFor(op2.usr) ){
		this.log('op1 knows about op2: ', op1.cx,'more than', op2.cx,'for user',op2.usr);
		// But if op1 and op2 are the same operation (del) then op1 could be noopified - we prefer to avoid an unwanted double delete instead of insert two times
		if (op1.type==myOP.DEL && op1.isIdentical(op2))
			op1.type = myOP.NOOP;
		else
			return;
	}
	
	if(op2.type!=myOP.NOOP && op1.type!=myOP.NOOP)
		if(op2.start<op1.start){	// if op2 starts before op1 then change op1
			if(op2.type==myOP.INS)
				op1.move(op2.length);
			else{ // if (op2.type==myOP.DEL){
				if(op2.end <= op1.start){	// op2 happens completely before op1
					op1.move(-op2.length);
				}else if(op1.type==myOP.DEL){
					if(op2.end < op1.end){ // op1 is partially inside 
						op1.text = op1.text.slice(op2.end-op1.start);
						op1.start = op2.end;
						op1.move(-op2.length);
					}else // if(op2.end > op1.end){ // op1 is completely inside op2
						op1.type=myOP.NOOP;
				}else
					op1.move(-(op1.start-op2.start)); // op1 is an insert op and don't care about op2.length
			}
		} else if(op2.start==op1.start){
			if(op2.type==myOP.INS){
				if( op1.shift>op2.shift ){
					op1.move(op2.length);
					op1.shift -= op2.length;
				}else if (op2.shift>op1.shift){
					//op1.op[1]--;
					op2.shift -= op1.length;
				}else if(op1.type==myOP.DEL || op2.usr<op1.usr)
					op1.move(op2.length);
			}else if (op2.type==op1.type){
				if(op2.end<op1.end){
					op1.text = op1.text.slice(op2.end-op1.start);
					op1.start = op2.end;
					op1.move(-op2.length);
				}else
					op1.type = myOP.NOOP;
			}
		}			
	
	op1.cx[op2.usr]++ //TODO verify if not op1.cx[op1.usr]+1
	this.log(op1.toString(), 'from', op11, op2.toString());
}
	
/*
	Base Operation Object
*/
var myOP = function(usr, op, cx){
	this.usr = usr;
	
	this.type = op[0];
	this.start = parseInt(op[1]);
	this.text = op[2];
	this.length = this.text.length;
	this.end = this.start+this.length;
		
	this.cx = cx;
	
	this.shift = 0;
}

// get the context value for a specified user
myOP.prototype.getContextFor = function(usr){
	if(!this.cx[usr])
		this.cx[usr]=0;

	return this.cx[usr];
}

// verify if op have similar context to the current operation
myOP.prototype.similarContext = function(op){		
	return this.getContextFor(op.usr) <= op.getContextFor(op.usr);
}
	
// verify if op have the same context of the current operation
myOP.prototype.identicalContext = function(op){
	var id = true;
	for (var usr in this.cx)
		if(this.cx.hasOwnProperty(usr)){
			id &= this.getContextFor(usr) == op.getContextFor(usr);
			if(id == false)
				return false;
		}
	
	return id == true;
}

// verify if op is successive to the current operation
myOP.prototype.isOlder = function(op){
	for (var usr in this.cx)
		if(this.cx.hasOwnProperty(usr))
			if(this.getContextFor(usr) < op.getContextFor(usr));
				return true;
		
	return false;
}

// verify if two op are identical
myOP.prototype.isIdentical = function(op){
	return this.type==op.type && this.start==op.start && this.text==op.text;
}

// clone this op object
myOP.prototype.clone = function(){
	var op1 = new myOP(this.usr, [0,0,0], JSON.decode(JSON.encode(this.cx)));
	op1.type = this.type;
	op1.start = this.start;
	op1.text = this.text;
	op1.length = this.length;
	op1.end = this.end;
	
	op1.shift = this.shift;
	return op1;
}

// move the operation of lenght chars
myOP.prototype.move = function(length){
	if(length < 0)
		this.shift -= length;
		
	this.start += length;
	this.length = this.text.length;
	this.end = this.start+this.length;
}
	
myOP.prototype.toString = function(){
	return ['[',this.type, ',',this.start, ',\'',this.text, '\',',this.shift,']',JSON.encode(this.cx)].join('');
}

// Available operations
myOP.NOOP = 'noop';
myOP.INS = 'ins';
myOP.DEL = 'del';
