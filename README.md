# sylvester.js
numerical calculation and vector calculation library for javascript

説明文、英語で書こうとしてけどめんどくさいので日本語で書く。今度英語でも書く

sylvester.jsは直感的にかけるjavascirptのベクトル演算ライブラリです。<br>
他のライブラリでは例えば関数型のような書き方や、メソッドをつなげるような書き方をせねばならず、直感的に書くことができませんが、このsylvester.jsではまるで教科書に乗っている式を書くようにベクトル演算ができます。

# How to use
sylvester.jsの使い方はかんたんです。<br>
1.calcObjectオブジェクトで変数やベクトル、行列を定義する。<br>
2.式をcalc関数の中に書く<br>
3.動かす<br>
## 1.define variable
式内で使う行列やベクトルの宣言はcalcObjectで行います。<br>
まずcalcObjectに数字もしくは配列を渡してください。<br>
ここで数字を渡すと数字として、１次元配列を渡すとベクトルとして、２次元配列を渡すと行列として認識します。
## 2.calculation equation
次にcalc関数の中に文字列の形式で式を書きます。例えば行列A,Bの掛け算を計算したい場合。
```javascript
calc("A*B");
```
と書けば計算してくれます。返り値はcalcObjectです。<br>
計算の結果はcalcObjectないのelementsに格納されるので、例えば
```javascript
console.log(calc("A*B").elements);
```
と書けば掛け算の結果がわかります。
今のところ+,-,*,/の演算と()、乗算(^)、転地(^T or ^t)、逆行列(^-1)をサポートしています。<br>
## 3.use function
式内では関数を使用することもできます。<br>
関数を使用したい場合、defineFunction関数に関数名と、変数の個数を入力したら関数が使用できます。<br>
例えばtest(a)を式内で利用したい場合
```javascript
a = calcObject(~);
defineFunction("test",1);
calc("test(a)");
```
と書くことになります。<br>

今のところ行列式を求める関数det(matrix)<br>
変数の方を求める関数judgeType(calcObject)<br>
転地を求める関数transverse(calcObject)<br>
逆行列を求める関数inverse(matrix)<br>

が用意されています。<br>


続きはおいおい書くよ！