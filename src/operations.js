import { log } from './index.js';
import crypto from 'crypto';
import { secretTemplate, keysTemplate } from './templates.js';

export async function deleteResource(obj, k8sCoreApi) {
  log(`Secret ${obj.metadata.name} was deleted`);
  k8sCoreApi.deleteNamespacedSecret(
    `${obj.metadata.name}`,
    `${obj.metadata.namespace}`
  );
}

export async function applySecret(obj, k8sCoreApi, privateKey) {
  const objName = obj.metadata.name;
  const objNamespace = obj.metadata.namespace;
  var newsecretTemplate = secretTemplate(obj);

  for (const key in newsecretTemplate.data) {
    let encData = crypto
      .privateDecrypt(
        {
          key: privateKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha256'
        },
        Buffer.from(newsecretTemplate.data[key], 'base64')
      )
      .toString('utf-8');
    newsecretTemplate.data[key] = encData;
  }
  try {
    const response = await k8sCoreApi.readNamespacedSecret(
      `${objName}`,
      `${objNamespace}`
    );
    const newSecret = response.body;
    newSecret.data = newsecretTemplate.data;
    k8sCoreApi.replaceNamespacedSecret(
      `${objName}`,
      `${objNamespace}`,
      newSecret
    );
    log(`Secret ${objName} was updated!`);
    return;
  } catch (err) {
    log(`Can't read or update ${objName} state...`);
  }
  try {
    k8sCoreApi.createNamespacedSecret(`${objNamespace}`, newsecretTemplate);
    log(`Secret ${objName} was created!`);
  } catch (err) {
    log(err);
  }
}

export async function getPrivateKey(k8sCoreApi) {
  const objName = 'seks-operator-keys';
  const objNamespace = 'seks-operator';
  try {
    const response = await k8sCoreApi.readNamespacedSecret(
      `${objName}`,
      `${objNamespace}`
    );
    const keysSecret = response.body;
    log(`Encryption keypair already exists!`);
    const privateKey = atob(keysSecret.data.privateKey);
    const publicKey = atob(keysSecret.data.publicKey);
    printPublicKey(publicKey);
    return privateKey;
  } catch (err) {
    log(`Can't read encryption keys, generating the new keypair...`);
  }
  try {
    const keyPair = crypto.generateKeyPairSync('rsa', {
      modulusLength: 4096, // bits - standard for RSA keys
      publicKeyEncoding: {
        type: 'pkcs1', // "Public Key Cryptography Standards 1"
        format: 'pem' // Most common formatting choice
      },
      privateKeyEncoding: {
        type: 'pkcs1', // "Public Key Cryptography Standards 1"
        format: 'pem' // Most common formatting choice
      }
    });

    const newkeysTemplate = keysTemplate(keyPair.privateKey, keyPair.publicKey);
    k8sCoreApi.createNamespacedSecret(`${objNamespace}`, newkeysTemplate);
    log(`Secret ${objName} was created!`);
    printPublicKey(keyPair.publicKey);
    return keyPair.privateKey;
  } catch (err) {
    log(err);
  }
}

function printPublicKey(publicKey) {
  log(
    'To start encrypt secrets you have to write the public key on your machine using the next command:'
  );
  console.log('cat > "${HOME}/.sencrypt.key" << EOF');
  console.log(publicKey);
  console.log('EOF');
}
