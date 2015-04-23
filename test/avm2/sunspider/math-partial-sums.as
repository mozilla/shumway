
function verifyTest() {
    var n = 2000;
    var a1 = a2 = a3 = a4 = a5 = a6 = a7 = a8 = a9 = 0.0;
    var twothirds = 2.0/3.0;
    var alt = -1.0;
    var k2,  k3,  sk,  ck = 0.0;
    
    for (var k = 1; k <= n; k++){
        k2 = k*k;
        k3 = k2*k;
        sk = Math.sin(k);
        ck = Math.cos(k);
        alt = -alt;
        
        a1 += Math.pow(twothirds,k-1);
        a2 += Math.pow(k,-0.5);
        a3 += 1.0/(k*(k+1.0));
        a4 += 1.0/(k3 * sk*sk);
        a5 += 1.0/(k3 * ck*ck);
        a6 += 1.0/k;
        a7 += 1.0/k2;
        a8 += alt/k;
        a9 += alt/(2*k -1);
    }
    var a = [a2,a2,a3,a4,a5,a6,a7,a8,a9];
    var expectedAns = [87.9935444652217,87.9935444652217,0.9995002498750635,30.307963126682765,42.99485321081218,8.178368103610284,1.6444341918273961,0.6928972430599403,0.7852731634052603];
    for (var i=0; i<a.length; i++) {
      if (Math.abs(a[i]-expectedAns[i]) > .00001) {
        print('a'+i+': '+a[i]+' !== expectedAns: '+expectedAns[i]);
        return false;
      }
    }
    return true;
}

if (verifyTest()) {
  print("Pass");
}
