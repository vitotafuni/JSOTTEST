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


// some global variables
var exec = [];		
var time = [];
var rt = [];

// a generic funciton for execute local and remote ops in the simulator
var apply_op = function(op){		
	var text = rt[this.usr];
	text.innerHTML = exec_ops( text.innerHTML, [op]);
};		

// log function 
var log_op = log_off;
function log_off(){}
function log_on(){ console.log.apply(console,arguments) };

/*
	executeCase: main function for execute a specific case
*/
function executeCase(cid){
	rt=[];
	exec=[];
	time=[];
	var op_table = cases[cid].ops;
	var rcv = cases[cid].rcv;//.slice(0,1);
	var init_text = cases[cid].init_text;
	for (var uid=0; uid<rcv.length; uid++) {
		time[uid] = new Date().getTime();
		exec[uid] = [];
		rt[uid] = document.getElementById('text'+uid);
		rt[uid].innerHTML = init_text;
		
		// prepare an OT object for every user
		var ot = new myOT({
			usr:uid,
			opToLocal: apply_op,
			opToRemote: apply_op,
			log: log_op
		});
		
		var rcvu = getOpsFor(rcv[uid], op_table);
		for (var i=0; i<rcvu.length; i++) {
			var op = rcvu[i];
			log_op('adding',op.toString());
			
			if(op.usr!=uid ) // remote operations are transformed if needed
				ot.opFromRemote(op);
			else
				ot.opFromLocal(op);
		}

		log_op('\t',ot.execOps);
		rt[uid].className = (rt[uid].innerHTML == cases[cid].exp_text)? 'yes':'no';
		time[uid] = new Date().getTime()-time[uid];
		document.getElementById('time'+uid).value = time[uid]/1000;					
	}

	// statistic of corrected case		
	var corr=1;
	for( var uid=0; uid<rcv.length; uid++)
		if(rt[uid].className=='no'){
			for (var uid2=uid; uid2<rcv.length; uid2++)
				if(rt[uid].innerHTML==rt[uid2].innerHTML)
					rt[uid].className=rt[uid2].className='maybe';
		}else
			corr++
		
	document.getElementById('corr_exec').value = corr+"/"+uid;
	document.getElementById('corr_exec_info').style.display='block';

	// statistic of average execution time
	var avg_time=0;
	for(var i =0; i<time.length; i++)
		avg_time += time[i];
		
	document.getElementById('avg_time').value = (avg_time/time.length)/1000;
	document.getElementById('avg_time_info').style.display='block';
}

/*
	recheck: check each user result text against the expected text
*/
function recheck(){
	var exp_text = document.getElementById('exp_text').value;
	var u=cases[document.getElementById('cases').value].rcv.length;
	var rt=[];
	
	var corr=1;
	
	for( var uid=0; uid<u; uid++){
		if(!rt[uid])
			rt[uid] = document.getElementById('text'+uid);
		else
			if(rt[uid].className == 'maybe') continue;
			
		rt[uid].className = (rt[uid].innerHTML == exp_text)? 'yes': 'no';
		if(rt[uid].className=='no')
			for (var uid2=uid+1; uid2<u; uid2++){
				if(!rt[uid2])
					rt[uid2] = document.getElementById('text'+uid2);
				if(rt[uid].innerHTML==rt[uid2].innerHTML)
					rt[uid].className=rt[uid2].className='maybe';
			}
		else
			corr++
	}
	
	document.getElementById('corr_exec').value = corr+"/"+uid;
}

/*
	getOpsFor: return a list of myOP from the case dependind on the list of received ops passed
*/
function getOpsFor(rcv, op_table) {
	var rcvu = new Array();
	for (var opid=0; opid<rcv.length; opid++){
		var op = op_table[rcv[opid]];
		rcvu[opid] = new myOP(op.uid, JSON.decode(JSON.encode(op.op)), JSON.decode(JSON.encode(op.cx)));
	}
	return rcvu;
}

/*
	exec_ops: execute a list of ops against a text
*/
function exec_ops(txt, ops) {
	for (var i=0; i<ops.length; i++) {
		switch(ops[i].type){
			case myOP.INS: txt = txt.replace(new RegExp(['([\\s\\S]{',ops[i].start,'})'].join('')),'$1'+ops[i].text); break;
			case myOP.DEL: txt = txt.replace(new RegExp(['([\\s\\S]{',ops[i].start,'})[\\s\\S]{0,',ops[i].length,'}'].join('')),'$1'); break;
			default: break;
		}					
	}
	
	return txt;
}
