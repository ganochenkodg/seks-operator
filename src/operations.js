import { log } from './index.js';
import crypto from 'crypto';
import { secretTemplate, keysTemplate } from './templates.js';

export async function deleteResource(obj, k8sCoreApi) {
  log(`Deleted ${obj.metadata.name}`);
  k8sCoreApi.deleteNamespacedSecret(
    `${obj.metadata.name}`,
    `${obj.metadata.namespace}`
  );
}

export async function applySecret(obj, k8sCoreApi) {
  const objName = obj.metadata.name;
  const objNamespace = obj.metadata.namespace;
  try {
    const response = await k8sCoreApi.readNamespacedSecret(
      `${objName}`,
      `${objNamespace}`
    );
    const newPvc = response.body;
    const currentCapacity = newPvc.spec.resources.requests.storage.replace(
      /[^0-9]/g,
      ''
    );
    if (currentCapacity < obj.spec.capacity) {
      newPvc.spec.resources.requests.storage = obj.spec.capacity + 'Gi';
      k8sCoreApi.replaceNamespacedPersistentVolumeClaim(
        `${objName}`,
        `${objNamespace}`,
        newPvc
      );
      log(`PVC ${objName} was updated! You may have to expand Storage FS.`);
    } else {
      log(`PVC ${objName} capacity can only be increased!`);
    }
    return;
  } catch (err) {
    log(`Can't read or update ${objName} state...`);
  }
  try {
    const newpvcTemplate = pvcTemplate(obj);
    k8sCoreApi.createNamespacedPersistentVolumeClaim(
      `${objNamespace}`,
      newpvcTemplate
    );
    log(`PVC ${objName} was created!`);
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
    log(`Secret ${objName} already exists!`);
    const privateKey = atob(keysSecret.data.privateKey);
    const publicKey = atob(keysSecret.data.publicKey);
    printPublicKey(publicKey);
    return privateKey;
  } catch (err) {
    log(`Can't read ${objName} state, trying to generate new keys...`);
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
  console.log('cat <<EOF | kubectl apply -f -');
  console.log(publicKey);
  console.log('EOF');
}
