import crypto from 'crypto';
import fs from 'fs';

let base64string =
  'Ou/2NjIhLn7FmozaYdsQrs7eW2SoUy0Wd4SFPY/BX1AzE0D9YRCDY5ucz4mb6dZVue9nTUNQWlWD+uPpb/8hY5qD5nXLAHO79nPXc2W7seGmhRc/zDWyo8u5TV+LUEKY9GuGbjhX4OpTb0TyLwzZ7gzzmxdhaaqi2tq/FQNgxNBmXpJBEsOKpGQy9Hv2g1I8+Eci8307UUzqm6Ns8135iu+gA//k5nA4egCBXF8h2UR+c4SAV6f/da4FNziwxjcAWEuO63iKdkj4rXWaI2kSXC10uoKxL34pYzYM7j28je5IbV2glXjH9RbFvaVC+qPdJuSbwnlPifkcT/buTc4OS9NCCkzFsCcG1ia9Ds4ffJMr3fdXMAwdu2WgFe60ifBjl41ZXHhtA0MU4U6s7V7c3BX3eG1S/odesHww5R/5tbQcbpD4yTaVRdc8VhPa7G5GA3YwmBuAm5wDevaj6uxddn7xuoDzfeOVBUawGt4fn/UGjpSETsS7I0xAsXK0+v+JPOOlOVo/ytcBjdResb0ePm28mGpZUIQElObddBD4rNzQIne/UEnf1q73F6ZeRrPgz/jzQZVxFZigNluqHtDuhb45+DX46/6EdclrxorbXhwo3mLr+bnH7qIHPaaeFCyNuzl5JnDB5uiWinIj4sDQ2MHRXjMILu3uoQoZz3BIFxw=';

const privateKey = fs.readFileSync('id_rsa_private.pem', { encoding: 'utf-8' });

const decryptedData = crypto.privateDecrypt(
  {
    key: privateKey,
    // In order to decrypt the data, we need to specify the
    // same hashing function and padding scheme that we used to
    // encrypt the data in the previous step
    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    oaepHash: 'sha256'
  },
  Buffer.from(base64string, 'base64')
);

console.log(decryptedData.toString('utf-8'));
