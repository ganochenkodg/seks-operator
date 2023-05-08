![seks_operator_logo](resources/logo_wide.png)

# Seks Operator

`Seks Operator` encrypts K8S Secrets with an asymmetric key and creates EncSecret manifests that can be stored securely in git repositories.

## Quickstart

### Prerequisite

The operator includes one custom resource called `EncSecret`. Install the CRD by running the command below:

```bash
kubectl apply -f https://raw.githubusercontent.com/ganochenkodg/seks-operator/master/deploy/crds/crd-encsecret.yaml
```

You will see the next output:

```console
customresourcedefinition.apiextensions.k8s.io/encsecrets.dganochenko.work created
```

Install the operator by running the command below:

```bash
kubectl apply -f https://raw.githubusercontent.com/ganochenkodg/seks-operator/master/deploy/operator.yaml
```

```console
namespace/seks-operator created
serviceaccount/seks-operator-sa created
clusterrole.rbac.authorization.k8s.io/seks-operator-role created
clusterrolebinding.rbac.authorization.k8s.io/seks-operator-rolebinding created
deployment.apps/seks-operator created
```

Check if operator works:

```console
$ kubectl get pod -n seks-operato
NAME                             READY   STATUS    RESTARTS   AGE
seks-operator-5f59fbdd75-hnd7h   1/1     Running   0          70s
```

Install the CLI tool

```bash
curl -s -L https://raw.githubusercontent.com/ganochenkodg/seks-operator/master/sencrypt/sencrypt-linux -o sencrypt
# download "sencrypt-osx" if you use Mac OS
chmod a+x sencrypt
sudo mv sencrypt /usr/local/bin/
```

Check operator logs and save public key, used for encrypting secrets.

```console
$ kubectl logs seks-operator-5f59fbdd75-hnd7h -n seks-operator
5/8/2023, 2:17:25 PM: Can't read encryption keys, generating the new keypair...
5/8/2023, 2:17:28 PM: Secret seks-operator-keys was created!
5/8/2023, 2:17:28 PM: To start encrypt secrets you have to write the public key on your machine using the next command:
cat > "${HOME}/.sencrypt.key" << EOF
-----BEGIN RSA PUBLIC KEY-----
MIICCgKCAgEAqmuQaD7FAi24Pqlz/CIu/vuLwIQmBnh8HtFpJmr3hDfFbAnYF087
snihYNfs+IOStZT9jd7UyvTRm8IeLiS5nyU5H7ztqe3MwIg39zEXMDvlb07gpKKO
/WWX+clztaPwQUD7Qvf729SOtwvQO9RMP8sPfUEHBMtFaAAb22C1ZuHfTs46knOH
tDGEo2ivUe1itK33KWsMLi3VuzYifed188dywmMog4sT30MXBe/ePkyUxyiScsR8
vzo2AzBP5w0OhJm/PA9EkmUuX+tnId/n6f5qB46Sx6XM0TLPdgPdl9cGjemSoCm1
GkAY9adZZEV4ZJmdOZH658sNfHluJTg5g0oMVIGC0VxYcW9ron2mvo1Py2hZ/ozg
yelnVMvstmtaF7UvULHIFmX+ccMQTW7pxnSnOPyUCd8r/J+BtrjXiovG84L+Zwp5
4kZ/kaW+9wWN93UKncHGz/tiX1+jIcxx+HWmwEpd6kNFtWdUu3crJHfVRpyOUVdJ
dYjhE8dCU+gl5/KQZmtO7meUNdKmnE9Tmn9Ys6XtJBEiMDVCoXqlDVDahaKVZfLU
90ZwTQadCpJ71hIc9UkqOR+1o+YhCHde0TpxlvjGqWaJFyttg/r75t5vZ22Ntlww
bIBKepNg7NgR8BntHL5Ri0+cE05f9DleObEGRfe03si/p1p8S3Se6+0CAwEAAQ==
-----END RSA PUBLIC KEY-----

EOF
5/8/2023, 2:17:28 PM: Watching API
```

### Usage

At first you have to have to prepare some K8S secret, we will generate the new one:

```bash
kubectl create secret generic test --from-literal=foo=bar --from-literal=hello=world -o yaml --dry-run=client > secret.yaml
```

After that we are going to encrypt that secret using CLI tool

```console
$ sencrypt < secret.yaml > enc_secret.yaml
$ cat enc_secret.yaml
apiVersion: dganochenko.work/v1alpha1
data:
    foo: XZ/N+CXgErEScsbksX30IH+YyAxDs4O7DZKkWHbYBbvBtZaTRQjCArlTFXQ4SIGhuUa0jZHkfYBCIpesKPaSMsg7uEnbhYTBpuIsZetbGGQH5wz1HcuUnDYSdDnqFkvHQBdWV9DV9ZcoqM/isiPnzehtdZVK/aFXeI+z9hw5PAdhmOMpbycXZdk2ts038k3h2DfUPyggOUEWsRi93OrrS9g8Lw4iaSaNRW5ACoyjsa8pO1Wc91mH4m8+QskHnNBfSdbI9h+t0MfYBz8NRstaMsAaXjw7jVJELsiaY7uSukgBcczs9p1Asuuv0/2T3PHdldL4vdi3GHlsulPjRQUPs5pjqYSjRDu2YCsj+4oB9trAQY235v/dnrIG3LThbmak7Ir0VidOvvs96x/XI9OUVBoJN5HQFXsn2RBucqL2+TnK+2aFk0ibPLWto5s1Lc2V8TcRnqv+lXR2ZpDNsGkycqUvs23/L63IOeYB2zVqI/uNa/S+x6P8spb/b6/xZbVw0srk+F/3kB2ePJZQBHIG5Jryu8TEvHNu5+5WuamV7Gl+LOzrfpL8/udg4Ijvz8aDZDC7hwaPGIPMImgIw8odYFePnaZqO1OXycpUhcmNpEMsQYF6WCcGkBbeNiLC+JEHYsnjeZ18jFVsHu4hKkLvmo7nTH/PnDB6cq6c6LXHJCU=
    hello: DTc1TvnQ/6kL5sZyfvn4rEG0BQWy9d+kvKfXz6K2gRVQW/1h7hREitGskYljTJVWjm7OvSUAIX3ZOZYeg+p76YLPzqwpwbnyJ0/63PAV7Y7C4ho/puF0tODIlvrLc6iEZ4UmaC0KamXPV1hpAOn2Jy7P7plBq3R48JU5BgXZtOX1V92qp0eg2xm6N/2Cdz2CnKVCbwufkl55ElYknUlc04ZoPDv8tJBgEDDlGUo5ioNzVfuzjRDMvO6zj0kODuVylojX/ms+15H/cXjXF/8C002sGp9xcK6LVuSGeJ72v8VTigI7Iqo4p1vHgqvXgHRe6qeuuOO/aSLyCmY9KilN85Xv8HWFuFdD9FK69lvi0U+xkrIMVOouIyTh0nPEH3dIwoo/qhuzWsS0v0cengOhjxB20Tt2CYVNnYA5NkqapJHi5Jm3a3TSwH6SGhzyY1OW2pieBL6GEoF3DYkfnroPbEfqFJWqUkUP4U5+uTEl9ooRj0LtmMJpcav5nTVeFyBagNWLWS3gWo0m5GSLOF8+eTIxEXsx4gfpX1WianTD1eTzShR0idFnllSo54Kgz0zjeM/eR3Ezx7dKUZrb99xcmoYKQuY5d8CGSRKbuahXgu0fnZU8/ktQgiEuamiHKtz1uff9YudhngwSLaIfUUrEADOrGI4rU3WLwttPTJ3zNys=
kind: EncSecret
metadata:
    creationTimestamp: null
    name: test
$ kubectl apply -f enc_secret.yaml
encsecret.dganochenko.work/test created
```

Let's check operator logs and get data from the provisioned secret

```console
$ kubectl logs seks-operator-5f59fbdd75-hnd7h -n seks-operator|tail -n 3
5/8/2023, 2:34:54 PM: Received event in phase ADDED.
5/8/2023, 2:34:55 PM: Can't read or update test state...
5/8/2023, 2:34:55 PM: Secret test was created!
$ kubectl get secret test -o jsonpath='{.data.foo}'| base64 -d
bar
$ kubectl get secret test -o jsonpath='{.data.hello}'| base64 -d
world
```

## Disclaimer of Warranty

This project is made for educational and research purposes only. 
The author does not recommend using it in production and in environments where stability are predictability are important. 
There are many solutions with the same functionality, proven, reliable and well documented. 
The author would recommend to use [Bitnami Sealed Secrets](https://github.com/bitnami-labs/sealed-secrets) as perfect replacement.
