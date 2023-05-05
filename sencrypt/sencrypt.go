package main

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha256"
	"crypto/x509"
	"encoding/base64"
	"encoding/pem"
	"fmt"
	"gopkg.in/yaml.v3"
	"io"
	"io/ioutil"
	"os"
)

func Encrypt(publicKey *rsa.PublicKey, plainText string) string {
	cipher, err := rsa.EncryptOAEP(sha256.New(), rand.Reader, publicKey, []byte(plainText), nil)
	if err != nil {
		fmt.Printf("Unable to encrypt", err)
		os.Exit(1)
	}

	return base64.StdEncoding.EncodeToString(cipher)
}

func GetKey() *rsa.PublicKey {
	home, _ := os.UserHomeDir()
	publicKeyPath := home + "/.sencrypt.key"

	pub, err := ioutil.ReadFile(publicKeyPath)
	if err != nil {
		fmt.Printf("Unable to read %s.\nPlease place the public key there.", publicKeyPath)
		os.Exit(1)
	}

	pubPem, _ := pem.Decode(pub)

	publicKey, err := x509.ParsePKCS1PublicKey(pubPem.Bytes)
	if err != nil {
		fmt.Printf("Unable to parse RSA public key", err)
		os.Exit(1)
	}

	return publicKey
}

func GetData() map[string]interface{} {
	file := os.Stdin
	fi, _ := file.Stat()
	size := fi.Size()
	if size == 0 {
		fmt.Println("Stdin is empty, please pass some Secret")
		os.Exit(1)
	}

	content, err := io.ReadAll(file)
	if err != nil {
		fmt.Println("Unable to parse stdin", err)
		os.Exit(1)
	}

	data := make(map[string]interface{})
	err = yaml.Unmarshal(content, &data)
	if err != nil {
		fmt.Println("Unable to parse passed YAML", err)
		os.Exit(1)
	}
	return data
}

func main() {
	publicKey := GetKey()
	data := GetData()

	data["apiVersion"] = "dganochenko.work/v1alpha1"
	for k, v := range data["data"].(map[string]interface{}) {
		data["data"].(map[string]interface{})[k] = Encrypt(publicKey, v.(string))
	}

	newdata, _ := yaml.Marshal(&data)
	fmt.Println(string(newdata))
}
