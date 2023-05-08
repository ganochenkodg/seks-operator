export function secretTemplate(apiObj) {
  var template = {
    apiVersion: 'v1',
    kind: 'Secret',
    type: `${typeof apiObj.type !== 'undefined' ? apiObj.type : 'Opaque'}`,
    metadata: {
      name: `${apiObj.metadata.name}`,
      namespace: `${apiObj.metadata.namespace}`
    },
    data: {}
  };
  template.data = apiObj.data;
  return template;
}

export function keysTemplate(privateKey, publicKey) {
  var template = {
    apiVersion: 'v1',
    kind: 'Secret',
    type: 'Opaque',
    metadata: {
      name: 'seks-operator-keys',
      namespace: 'seks-operator'
    },
    data: {
      privateKey: `${btoa(privateKey)}`,
      publicKey: `${btoa(publicKey)}`
    }
  };
  return template;
}
