
generate:
	openssl genrsa -out privkey.pem
	openssl req -new -x509 -key privkey.pem -out cacert.pem -days 1095

clean:
	-rm *.pem

.PHONY: generate clean
