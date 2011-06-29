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


var cases = new Array();

cases[cases.length] = {
	'title': 'simple DO interaction',
	'init_text': 'abc',
	'exp_text': 'XaWVcY',
	'ops': {
		'a': {'op': [myOP.INS,0,'X'], 'uid': 0, 'cx': [0,0]}, 
		'b': {'op': [myOP.INS,4,'Y'], 'uid': 0, 'cx': [1,0]},
		'c': {'op': [myOP.DEL,1,'b'], 'uid': 1, 'cx': [0,0]},
		'd': {'op': [myOP.INS,1,'V'], 'uid': 1, 'cx': [0,1]},
		'e': {'op': [myOP.INS,2,'W'], 'uid': 0, 'cx': [2,1]}
	},
	'rcv': [
		['a','b','c','e','d'],
		['c','d','a','b','e']
	]
}

cases[cases.length] = {
	'title': 'simple UNDO interaction',
	'init_text': 'abc',
	'exp_text': 'XaWbVcY',
	'ops': {
		'a': {'op': [myOP.INS,0,'X'], 'uid': 0, 'cx': [0,0]}, 
		'b': {'op': [myOP.INS,4,'Y'], 'uid': 0, 'cx': [1,0]},
		'c': {'op': [myOP.DEL,1,'b'], 'uid': 1, 'cx': [0,0]},
		'd': {'op': [myOP.INS,1,'V'], 'uid': 1, 'cx': [0,1]},
		'e': {'op': [myOP.INS,2,'W'], 'uid': 0, 'cx': [2,1]},
		'c1':{'op': [myOP.INS,1,'b'], 'uid': 1, 'cx': [0,0]}
	},
	'rcv': [
		['a','b','c','e','d','c1'],
		['c','d','a','b','e','c1']
	]
}

cases[cases.length] = {
	'title': 'dOPT puzzle',
	'init_text': 'abc',
	'exp_text': 'bx',
	'ops': {
		'O1': {'op': [myOP.DEL,0,'a'], 'uid': 0, 'cx': [0,0]},
		'O2': {'op': [myOP.INS,2,'x'], 'uid': 0, 'cx': [1,0]},
		'O3': {'op': [myOP.DEL,2,'c'], 'uid': 1, 'cx': [0,0]}
	},
	'rcv': [
		['O1','O2','O3'],
		['O3','O1','O2']
	]
}

cases[cases.length] = {
	'title': 'TP2 puzzle (false-tie)',
	'init_text': 'abc',
	'exp_text': 'a21c',
	'ops': {
		'O1': {'op': [myOP.INS,2,'1'], 'uid': 0, 'cx': [0,0,0]}, 
		'O2': {'op': [myOP.INS,1,'2'], 'uid': 1, 'cx': [0,0,0]},
		'O3': {'op': [myOP.DEL,1,'b'], 'uid': 2, 'cx': [0,0,0]}
	},
	'rcv': [
		['O1','O2','O3'],
		['O2','O3','O1'],
		['O3','O2','O1']
	]
}

cases[cases.length] = {
	'title': 'consecutives false-tie',
	'init_text': 'abcd',
	'exp_text': 'a123d',
	'ops': {
		'O1': {'op': [myOP.INS,1,'1'], 'uid': 0, 'cx': [0,0,0,0,0]}, 
		'O2': {'op': [myOP.INS,2,'2'], 'uid': 1, 'cx': [0,0,0,0,0]},
		'O3': {'op': [myOP.INS,3,'3'], 'uid': 2, 'cx': [0,0,0,0,0]},
		'O4': {'op': [myOP.DEL,1,'b'], 'uid': 3, 'cx': [0,0,0,0,0]},
		'O5': {'op': [myOP.DEL,2,'c'], 'uid': 4, 'cx': [0,0,0,0,0]}
	},
	'rcv': [
		['O1','O2','O3','O4','O5'],
		['O2','O5','O3','O4','O1'],
		['O3','O1','O5','O2','O4'],
		['O4','O1','O3','O2','O5'],
		['O5','O4','O3','O2','O1']
	]
}

cases[cases.length] = {
	'title': 'op precedences',
	'init_text': '',
	'exp_text': 'abc',
	'ops':{
		'O1':{"op":["ins",1,"c"],"uid":0,"cx":[0,0,1]},
		'O2':{"op":["ins",0,"a"],"uid":1,"cx":[0,0,0]},
		'O3':{"op":["ins",0,"b"],"uid":2,"cx":[0,0,0]}
	},
	'rcv': [
		['O3','O1','O2'],
		['O2','O3','O1'],
		['O3','O2','O1']
	]
}

cases[cases.length] = {
	'title': 'ABT',
	'init_text': 'abc',
	'exp_text': 'yzxc',
	'ops':{
		'O1': {'op':[myOP.DEL,1,'b'], 'uid':0, 'cx':[0,0,0]},
		'O2': {'op':[myOP.INS,2,'x'], 'uid':1, 'cx':[0,0,0]},
		'O3': {'op':[myOP.INS,1,'y'], 'uid':2, 'cx':[0,0,0]},
		'O4': {'op':[myOP.DEL,0,'a'], 'uid':0, 'cx':[1,1,1]},
		'O5': {'op':[myOP.DEL,0,'a'], 'uid':1, 'cx':[1,1,0]},
		'O6': {'op':[myOP.INS,2,'z'], 'uid':2, 'cx':[1,1,1]}
	},
	'rcv': [
		['O1','O2','O3','O4','O5','O6'],
		['O2','O1','O5','O3','O6','O4'],
		['O3','O2','O1','O6','O4','O5']
	]
}

cases[cases.length] = {
	'title': 'string-wise case',
	'init_text': 'abcd',
	'exp_text': 'all done',
	'ops':{
		'O1': {'op':[myOP.DEL,1,'bc'], 'uid':0, 'cx':[0,0,0]},
		'O2': {'op':[myOP.INS,1,'ll'], 'uid':1, 'cx':[0,0,0]},
		'O3': {'op':[myOP.INS,4,'one'], 'uid':2, 'cx':[0,0,0]},
		'O4': {'op':[myOP.INS,3,' '], 'uid':0, 'cx':[1,1,0]}
	},
	'rcv': [
		['O1','O2','O3','O4'],
		['O2','O1','O3','O4'],
		['O3','O2','O1','O4']
	]
}
