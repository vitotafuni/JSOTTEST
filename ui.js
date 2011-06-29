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
	uiComplete = Complete the user interface with some dynamic elements
*/ 
function uiComplete() {
	var c = document.getElementById('cases');
	for(var i=0; i< cases.length; i++){
		var co = document.createElement('OPTION');
		c.options.add(co);
		co.innerHTML = cases[i].title;
		co.value=i;
	}
		

	c.onchange = switchCase;
	c.value=0;
	c.onchange();
}

/*
	switchCase: Update the interface when a case is selected from the case switcher
*/
function switchCase() {
	var cid = this.value;
	
	// update the ops list
	var ol = document.getElementById('ops_list');
	ol.value = JSON.encode(cases[cid].ops).replace(/(^{|},)/g,'$1\n ').replace(/}$/,'\n}');
	eval('ol.onblur = function(){ cases['+cid+'].ops = JSON.decode(this.value) }')
	
	// update users list
	document.getElementById('users').innerHTML = '';
	var reg = new RegExp('"',"g");
	for (var u=0; u<cases[cid].rcv.length; u++)
		addUser(cid, u, JSON.encode(cases[cid].rcv[u]).replace(reg,'\''));
	
	// update init and expected texts
	var it = document.getElementById('init_text');
	it.value = cases[cid].init_text;
	eval('it.onblur = function(){ cases['+cid+'].init_text = this.value }');
	var et = document.getElementById('exp_text');
	et.value = cases[cid].exp_text;
	et.className = '';
	eval('et.onblur = function(){ cases['+cid+'].exp_text = this.value}');
	
	// hide stats info
	document.getElementById('gen_time_info').style.display='none';
	document.getElementById('corr_exec_info').style.display='none';
	document.getElementById('avg_time_info').style.display='none';			
}
	
/*
	addUser: add a user to the specified case (used for automatic generation)
*/
function addUser(cid, uid, value) {
	var us = document.getElementById('users');

	us.innerHTML += ['<div id="user',uid,'" class="user"> USER',uid,':<hr/'+'>',
		'received operations:<br/'+'>',
		'<input onblur="javascript: eval(\'cases[',cid,'].rcv[',uid,'] = JSON.decode(this.value)\')" value="',value,'"/'+'><br/'+'>',
		'result text:<br/'+'><textarea id="text',uid,'"></textarea><br/'+'>',
		'execution time:<input type="text" class="time" id="time',uid,'"/'+'>',
		'</div>'].join('');
}

/*
	addBlankUser: add a new blank user (used for manual generation)
*/
function addBlankUser() {
	var cid = document.getElementById('cases').value;
	var uid = cases[cid].rcv.length;
	cases[cid].rcv[uid] = [];
	addUser(cid,uid,'');
}

/*
	addBlankCase: add a new blank case (used for manual generation)
*/
function addBlankCase() {
	var n = cases.length;
	cases[n] = {'title':'blank_'+n, 'ops':{}, 'rcv':[]};
	
	var c = document.getElementById('cases');
	c.innerHTML += ['<option value=',n,'>',cases[n].title,'</option>'].join('');
	c.value = n; c.onchange();
}

/*
	toggleRandomCaseParams: show the random case config panel
*/
function toggleRandomCaseParams() {
	var r = document.getElementById('random_case').style;
	r.display = (r.display=='none' || r.display=='')? 'block':'none';
}

/*
	addRandomCase: generate a random case
*/
function addRandomCase() {
	// dictionary for random words generation
	var dict = ['1','2','3','4','5','6','7','8','9','0','q','w','e','r','t','y','u','i','o','p','l','k','j','h','g','f','d','s','a','z','x','c','v','b','n','m','à','è','é','ì','ò','ù',' ','?','!',',',';','.',':','-','_'];
	var n = cases.length;
	cases[n] = {'title':'random_'+n, 'init_text': '', 'exp_text': '', 'ops':{}, 'rcv':[]};
	
	var nu = parseInt(document.getElementById('nusers').value);
	var nos = parseInt(document.getElementById('nops').value);
	var pi = parseFloat(document.getElementById('pinsert').value)/100;
	var pd = parseFloat(document.getElementById('pdelete').value)/100;
	
	if(nos < nu){
		alert('Too much users for the number of operations specified!'); return;
	}else if(nos % nu !=0){
		alert('Operations have to be multiple of users!'); return;
	}else if(pi+pd!=1){
		alert('Total percentage of operation types must be 100'); return;
	}
	
	var time = new Date().getTime();

	var no=ni=nd=0;
	while (no<nos){
		// create fake context for each op (change to generate more complex simulations)
		var cx = []
		for (var cxi=0; cxi<nu; cxi++)
			cx[cxi] = parseInt(no/nu);
					
		for (var u=0; u<nu; u++) {
			var op=(Math.random()>0.5)? myOP.INS : myOP.DEL;
								
			// position is based on insert and delete ops previously generated
			var p = Math.max(Math.floor(Math.random()*(cases[n].init_text.length+ni-nd)),0);
			
			// ops at percentage
			if (op==myOP.INS){	
				if(ni/nos > pi){ 
					op=myOP.DEL; nd++; 
					cases[n].init_text += ni>=nd? "":"X"; //just in case there's nothing to delete
				}else 
					ni++; 
			}else{ 
				if (nd/nos > pd){ 
					op=myOP.INS; ni++; 
				}else{
					nd++; 
					cases[n].init_text += ni>=nd? "":"X"; //just in case there's nothing to delete
				}
			}


			cases[n].ops['O'+no] = {"op":[op,p,dict[Math.floor(Math.random()*dict.length)]], "uid":u, "cx":cx};
			
			// create array of received ops for each user
			if(no<nu)
				cases[n].rcv[u]=[]		
			
			// each user take his ops first 
			cases[n].rcv[u].push('O'+no);
			
			// go to next op
			no++;
		}

		// add remaining ops to each user
		for (var u1=0; u1<nu; u1++) 
			for (var u2=0; u2<nu; u2++)
				if(u1==u2) 
					continue;
				else
					cases[n].rcv[u1].push(cases[n].rcv[u2].slice((u1<u2)?-1:-nu)[0]);		
	}			
	
	document.getElementById('gen_time').value = (new Date().getTime()-time)/1000;
												
	var c = document.getElementById('cases');
	var co = document.createElement('OPTION');
	c.options.add(co);
	co.innerHTML = cases[n].title;
	co.value=n;
	c.value = n; c.onchange(); co=null;
	
	document.getElementById('gen_time_info').style.display='block';
	toggleRandomCaseParams();
}
