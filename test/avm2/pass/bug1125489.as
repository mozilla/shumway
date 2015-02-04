function map(test) {
	var foo: Boolean = true;
    switch (test) {
        case 1:
            if (foo) {
                return 1;
            }
            break;
        case 2:
            return 2;
    }
    return 3;
}

trace(map(1));
