var functions = ["rank", "det", "inverse","echelon","tr","dim"]
var functoins_arg = [1, 1, 1, 1, 1, 1]

var calcObject = function(matrix){
    this.elements = matrix;
}

function calc(formula){
    var stack = [];
	var infix   = split_formula(formula);
	infix = modify_infix(infix);
	var postfix = get_postfix(infix);
//	console.log("=>",postfix);
	var result;
	for(var num=0;num < postfix.length;num++){
		if("+-*/^=".indexOf(postfix[num]) != -1){
			result = new execFormula([stack.pop(), stack.pop()], postfix[num]);
			stack.push(result);
		}
		else if(functions.indexOf(postfix[num]) != -1){
			var arg = []
			for(var arg_cnt = 0;arg_cnt < functoins_arg[functions.indexOf(postfix[num])];arg_cnt++){
				arg.push(stack.pop().elements);
			}
			result = new execFunction(arg, postfix[num]);
			stack.push(result);
		}
		else{
			if(window[postfix[num]] instanceof calcObject){
				stack.push(window[postfix[num]]);
			}
			else if(!isNaN(postfix[num])){
				stack.push(new calcObject(parseFloat(postfix[num])));
			}
			else if(postfix[num] == "T" || postfix[num] == "t"){
				stack.push("transverse");
			}
			else{
				stack.push(new calcObject(window[postfix[num]]));
			}
		}
	}
	if(stack.length == 1){
		return stack[0]
	}
	else{
		return stack
	}
}

function split_formula(s) {
    var a = new Array();
    
    s = s + " "; 
	var literal = "";
    for (i = 0; i < s.length; i++) {
        var c = s.charAt(i);
        if ("+-*/^(), ".indexOf(c) != -1) {
            if (literal != "") a.push(literal);
            if (c != " ")  a.push(c);
            literal = "";
        }
		else {
            literal = literal + c;
        }
    }
    return a;
}

function modify_infix(infix){
	var return_infix = infix;
	for(var inf_cnt = infix.length;inf_cnt >= 0;inf_cnt--){
		if(infix[inf_cnt] == "^"){
			Array.prototype.splice.apply(return_infix,[inf_cnt-1,0].concat("("));
			Array.prototype.splice.apply(return_infix,[inf_cnt+3,0].concat(")"));
		}
		if(infix[inf_cnt] == "-"){
			if(infix[inf_cnt-1] == "^"){
				return_infix[inf_cnt] = "-1";
				return_infix.splice(inf_cnt+1, 1);
			}
			else{
				if("+-*/^(), ".indexOf(infix[inf_cnt-1]) == -1 && inf_cnt > 0){
					Array.prototype.splice.apply(return_infix,[inf_cnt,0].concat("+"));
					inf_cnt += 1
				}
				return_infix[inf_cnt] = "-1";
				Array.prototype.splice.apply(return_infix,[inf_cnt+1,0].concat("*"));
			}
		}
	}
	return return_infix;
}

function get_postfix(infix) {
    var postfix = new Array();
    expression(infix, postfix);
    return postfix;
}

function factor(infix, postfix) {
	var func_esc;
    if (infix[0] == "(") {
        infix.shift();
        expression(infix, postfix);
        if (infix[0] == ")") infix.shift();
    }
	else if(functions.indexOf(infix[0]) != -1 && infix[1] == '('){
		func_esc = infix[0];
		infix = infix.slice(2);
        expression(infix, postfix);
        if (infix[0] == ")"){
			infix.shift();
			postfix.push(func_esc);
		}
	}
	else {
        postfix.push(infix.shift());
    }
}

function term(infix, postfix) {
    factor(infix, postfix);
    while (1) {
        var c = infix[0];
        if (c == "*" || c == "/" || c == "^") {
            infix.shift(); 
			factor(infix, postfix); 
			postfix.push(c);
        } else {
            break;
        }
    }
}

function expression(infix, postfix) {
    term(infix, postfix);
    while (1) {
        var c = infix[0];
        if (c == "+" || c == "-") {
            infix.shift(); 
			term(infix, postfix);
			postfix.push(c);
        } else {
            break;
        }
    }
}

function execFormula(ops, operator){
    switch(operator){
        case "+":
            return execAdd(ops);
        case "-":
            return execMinus(ops);
        case "*":
            return execMult(ops);
		case "/":
			return execDivid(ops);
		case "^":
			return execPower(ops);
    }
}

var execAdd = function(inOps){
    var ans = [];
	if(judgeType(inOps[0]) == "matrix"){
		if(equalDim(inOps) && equalDim([inOps[0].elements, inOps[1].elements])){
			for(var m = 0;m < inOps[0].elements.length; m++){
				ans.push([]);
				for(var n=0; n<inOps[0].elements[m].length; n++){
					var cAns = inOps[0].elements[m][n] + inOps[1].elements[m][n];
					ans[m].push(cAns);
				}
			}
			return new calcObject(ans);
		}
		else{
			return null;
		}
	}
	else if(judgeType(inOps[0]) == "vector"){
		if(equalDim(inOps)){
			if(inOps[0].elements[0] instanceof Array){
				for(var n=0; n<inOps[0].elements.length; n++){
					var cAns = inOps[0].elements[n][0] + inOps[1].elements[n][0];
					ans.push([cAns]);
				}
				return new calcObject(ans);
			}
			else{
				for(var n=0; n<inOps[0].elements.length; n++){
					var cAns = inOps[0].elements[n] + inOps[1].elements[n];
					ans.push(cAns);
				}
				return new calcObject(ans);
			}
		}
		else{
			return null;
		}
	}
	else{
		return new calcObject(inOps[0].elements + inOps[1].elements);
	}
}

var execMinus = function(inOps){
    var ans = [];
	if(judgeType(inOps[0]) == "matrix"){
		if(equalDim(inOps) && equalDim([inOps[0].elements, inOps[1].elements])){
			for(var m = 0;m < inOps[0].elements.length; m++){
				ans.push([]);
				for(var n=0; n<inOps[0].elements[m].length; n++){
					var cAns = inOps[0].elements[m][n] - inOps[1].elements[m][n];
					ans[m].push(cAns);
				}
			}
			return new calcObject(ans);
		}
		else{
			return null;
		}
	}
	else if(judgeType(inOps[0]) == "vector"){
		if(equalDim(inOps)){
			if(inOps[0].elements[0] instanceof Array){
				for(var n=0; n<inOps[0].elements.length; n++){
					var cAns = inOps[0].elements[n][0] - inOps[1].elements[n][0];
					ans.push([cAns]);
				}
				return new calcObject(ans);
			}
			else{
				for(var n=0; n<inOps[0].elements.length; n++){
					var cAns = inOps[0].elements[n] - inOps[1].elements[n];
					ans.push(cAns);
				}
				return new calcObject(ans);
			}
		}
		else{
			return null;
		}
	}
	else{
		return new calcObject(inOps[0].elements - inOps[1].elements);
	}
}

var execMult = function(inOps){
	var ans;
	if(judgeType(inOps[0]) == "matrix"){
		if(judgeType(inOps[1]) == "matrix"){
			if(inOps[0].elements.length == inOps[1].elements[0].length){
				ans = [];
				for(var n = 0;n < inOps[1].elements.length;n++){
					ans.push([]);
					for(var m = 0;m < inOps[0].elements[0].length;m++){
						cans = 0;
						for(var now = 0;now < inOps[1].elements[0].length;now++){
							cans += inOps[1].elements[m][now]*inOps[0].elements[now][n];
						}
						ans[n][m] = cans;
					}
				}
				return transverse(new calcObject(ans));
			}
			else{
				return null;
			}
		}
		 if(judgeType(inOps[1]) == "vector"){
			if(!(inOps[1].elements[0] instanceof Array) &&inOps[1].elements.length == inOps[0].elements[0].length){
				ans = [];
				for(var n = 0;n < inOps[0].elements.length;n++){
					cans = 0;
					for(var now = 0;now < inOps[0].elements.length;now++){
						cans += inOps[1].elements[now]*inOps[0].elements[now][n];
					}
					ans.push(cans);
				}
				return new calcObject(ans);
			}
			else{
				return null;
			}
		 }
		else{
			ans = [];
			for(var n = 0;n < inOps[0].elements.length;n++){
				ans.push([]);
				for(var m = 0;m < inOps[0].elements[0].length;m++){
					ans[n][m] = inOps[1].elements*inOps[0].elements[n][m];
				}
			}
			return new calcObject(ans);
		}
	}
	else if(judgeType(inOps[0]) == "vector"){
		if(judgeType(inOps[1]) == "matrix"){
			if(inOps[0].elements.length == inOps[1].elements[0].length){
				ans = [];
				for(var n = 0;n < inOps[0].elements.length;n++){
					ans.push([]);
					cans = 0;
					for(var now = 0;now < inOps[1].elements[0].length;now++){
						cans += inOps[0].elements[now]*inOps[1].elements[now][n];
					}
					ans[n][0] = cans;
				}
				return new calcObject(ans);
			}
			else{
				return null;
			}
		}
		else if(judgeType(inOps[1]) == "vector"){
			if(inOps[0].elements.length == inOps[1].elements.length || inOps[1].elements.length == inOps[0].elements[0].length){
				if(!(inOps[1].elements[0] instanceof Array)){
					ans = 0;
					for(var now = 0;now < inOps[1].elements.length;now++){
						ans += inOps[1].elements[now]*inOps[0].elements[now][0];
					}
					return new calcObject(ans);
				}
				else{
					ans = [];
					for(var n = 0;n < inOps[1].elements.length;n++){
						ans.push([]);
						for(var now = 0;now < inOps[0].elements.length;now++){
							ans[n].push(inOps[1].elements[n][0]*inOps[0].elements[now]);
						}
					}
					return new calcObject(ans);
				}
			}
			else{
				return null;
			}
		}
		else{
			if(!(inOps[0].elements[0] instanceof Array)){
				ans = [];
				for(var n = 0;n < inOps[0].elements.length;n++){
					ans.push(inOps[1].elements*inOps[0].elements[n]);
				}
				return new calcObject(ans);
			}
			else{
				ans = [];
				for(var n = 0;n < inOps[0].elements.length;n++){
					ans.push([inOps[1].elements*inOps[0].elements[n][0]]);
				}
				return new calcObject(ans);
			}
		}
	}
	else{
		if(judgeType(inOps[1]) == "matrix"){
			ans = [];
			for(var n = 0;n < inOps[1].elements.length;n++){
				ans.push([]);
				for(var m = 0;m < inOps[1].elements[0].length;m++){
					ans[n][m] = inOps[0].elements*inOps[1].elements[n][m];
				}
			}
			return new calcObject(ans);
		}
		else if(judgeType(inOps[1]) == "vector"){
			if(!(inOps[1].elements[0] instanceof Array)){
				ans = [];
				for(var n = 0;n < inOps[1].elements.length;n++){
					ans.push(inOps[0].elements*inOps[1].elements[n]);
				}
				return new calcObject(ans);
			}
			else{
				ans = [];
				for(var n = 0;n < inOps[1].elements.length;n++){
					ans.push([inOps[0].elements*inOps[1].elements[n][0]]);
				}
				return new calcObject(ans);
			}
		}
		else{
			return new calcObject(inOps[0].elements*inOps[1].elements);
		}
	}
}

var execDivid = function(inOps){
	if(judgeType(inOps[0]) == "number"){
		if(judgeType(inOps[1]) == "number"){
			return new calcObject(inOps[1].elements / inOps[0].elements);
		}
		else if(judgeType(inOps[1]) == "vector"){
			if(!(inOps[1].elements[0] instanceof Array)){
				ans = [];
				for(var n = 0;n < inOps[1].elements.length;n++){
					ans.push(inOps[1].elements[n]/ inOps[0].element);
				}
				return new calcObject(ans);
			}
			else{
				ans = [];
				for(var n = 0;n < inOps[1].elements.length;n++){
					ans.push([inOps[1].elements[n][0]/inOps[0].elements]);
				}
				return new calcObject(ans);
			}
		}
		else{
			ans = [];
			for(var n = 0;n < inOps[1].elements.length;n++){
				ans.push([]);
				for(var m = 0;m < inOps[1].elements[0].length;m++){
					ans[n].push(inOps[1].elements[n][m]/inOps[0].elements);
				}
			}
			return new calcObject(ans);
		}
	} 
	else{
		return null;
	}
}

var execPower = function(inOps){
	var Ops = [inOps[1],inOps[1]]
	var res;
	if(inOps[0] == "transverse"){
		return transverse(inOps[1]);
	}
	else if(inOps[1] == "transverse"){
		return null;
	}
	else if(inOps[0].elements == "-1" && judgeType(inOps[1]) == "matrix"){
		return new calcObject(inverse([inOps[1].elements]))
	}
	else{
		for(var pow = 0;pow < inOps[0].elements -1;pow++){
			res = execMult(Ops);
			Ops[1] = res;
		}
		return res;
	}
}

var transverse = function(elem){
	var res = new calcObject([]);
	var n_len = 0;
	if(judgeType(elem) == "matrix"){
		for(var n = 0;n < elem.elements[0].length;n++){
			res.elements.push([])
			for(var m = 0;m < elem.elements.length;m++){
				res.elements[n].push(elem.elements[m][n]);
			}
		}	
	}
	else{
		if(elem.elements[0] instanceof Array){
			for(var n = 0;n < elem.elements.length;n++){
				res.elements.push(elem.elements[n][0]);
			}	
		}
		else{
			for(var m = 0;m < elem.elements.length;m++){
				res.elements.push([elem.elements[m]]);
			}
		}
	}
	return res;
}

var execFunction = function(arg, func_name){
	do_func = window[func_name];
	return new calcObject(do_func(arg));
}

var equalDim = function(inOps){
	if(judgeType(inOps[0]) == "matrix"){
		if(inOps[0].elements.length == inOps[1].elements.length && inOps[0].elements[0].length == inOps[1].elements[0].length){
			return true;
		}
		else{
			return false;
		}
	}
	else if(judgeType(inOps[0]) == "vector"){
		if(inOps[0].elements.length == inOps[1].elements.length){
			return true;
		}
		else{
			return false;
		}
	}	
	else{
		return true;
	}
}

var judgeType = function(elm){
	if(elm.elements instanceof Array){
		if(elm.elements[0] instanceof Array && elm.elements[0].length > 1){
			return "matrix";
		}
		else{
			return "vector";
		}
	}
	else{
		return "number";
	}
}


var defineFunction = function(func_name,  arg_num){
	var flag = true;
	for(var win in window){
		if(win == "func_name"){
			flag = false;
			break;
		}
	}
	if(flag){
		functions.push(func_name);
		functoins_arg.push(arg_num);
	}
}

var dim = function(mat){
	return rank(mat);
}

var rank = function(mat){
	var echelon_res = echelon(mat);
	var max_dim = 0;
	for(var i = 0;i < echelon_res.length;i++){
		var sum_dim = 0;
		for(var j = 0; j < echelon_res[0].length; j++){
			if(echelon_res[i][j] != 0){
				sum_dim++;
			}
		}
		if(max_dim < sum_dim){
			max_dim = sum_dim;
		}
	}
	return max_dim;
}

var inverse = function(matrix){
	var matrix_esc = matrix[0].clone();
	var mat_size = matrix[0].length;
	var sub_mat = [[]];
	for(var i = 0;i < mat_size-1;i++){
		sub_mat[0].push([]);
		for(var j  = 0;j < mat_size-1;j++){
			sub_mat[0][i].push(0);
		}
	}
	for(var i = 0;i < mat_size;i++){
		for(var j  = 0;j < mat_size;j++){
			var cnt_x = 0;
			var cnt_y = 0;
			for(var k = 0;k < mat_size;k++){
				for(var l = 0;l < mat_size;l++){
					if(i != k && j != l){
						sub_mat[0][cnt_y][cnt_x] = matrix[0][k][l];
						cnt_x++;
						if(cnt_x ==  mat_size-1){
							cnt_x = 0;
							cnt_y++;
						}
					}
				}
			}
			matrix_esc[i][j] = Math.pow(-1, i+j)*det(sub_mat);
		}
	}
	var det_res = new calcObject( det(matrix) );
	return execDivid([det_res, transverse(new calcObject(matrix_esc))]).elements;
}

var det = function(matrix){
	var mat_esc = matrix[0].clone();
	var mat_size = matrix[0].length;
	var det_num=1;
	 
	for(var mat_x=0;mat_x < mat_size;mat_x++){
		for(var mat_y=0;mat_y < mat_size;mat_y++){
			if(mat_x < mat_y){
				if(mat_esc[mat_x][mat_x] != 0){
					buf=mat_esc[mat_y][mat_x]/mat_esc[mat_x][mat_x];
				}
				else{
					buf=mat_esc[mat_y][mat_x]/0.000001;
				}
				for(var k=0;k < mat_size;k++){
					mat_esc[mat_y][k]-=mat_esc[mat_x][k]*buf;
				}
			}
		}
	}
	for(i=0;i < mat_size;i++){
		det_num*=mat_esc[i][i];
	}
	return(Math.round(det_num*1000000)/1000000);
}

var echelon = function(matrix){
	var matrix_esc = matrix[0].clone();
	var x_len = matrix[0][0].length;
	var y_len = matrix[0].length;
	var y_cnt = 0;
	for(var i = 0;i < x_len;i++){
		for(var j=y_cnt;j < y_len;j++){
			if(matrix_esc[j][i] != 0){
				matrix_esc = rowOpe([matrix_esc], j, y_cnt, 1).clone();
				for(var k = 0;k < y_len;k++){
					var buf = matrix_esc[k][i]/matrix_esc[y_cnt][i]
					if(y_cnt != k){
						for(var l = 0;l < x_len;l++){
							matrix_esc[k][l] -= matrix_esc[y_cnt][l] * buf;
						}
					}
				}
				y_cnt++;
				break;
			}
		}
	}
	return matrix_esc.clone();
}

var tr = function(matrix){
	var sum = 0;
	for(var i = 0;i < matrix[0].length;i++){
		sum+=matrix[0][i][i];
	}
	return sum;
}

var rowOpe = function(matrix, fromNum, forNum, buf){
	var matrix_esc = matrix[0].clone();
	var matrix_for_esc = matrix_esc[forNum].clone();
	for(var i = 0;i < matrix_esc[fromNum].length;i++){
		matrix_esc[forNum][i] = matrix_esc[fromNum][i]*buf;
		matrix_esc[fromNum][i] = matrix_for_esc[i];
	}
	return matrix_esc.clone();
}

Array.prototype.clone = function(){
    return Array.apply(null,this)
}
Array.prototype.clone = function() {
    if ( this[0].constructor == Array ) {
        var ar, n;
        ar = new Array( this.length );
        for ( n = 0; n < ar.length; n++ ) {
            ar[n] = this[n].clone();
        }
        return ar;
    }
    return Array.apply( null, this );
}