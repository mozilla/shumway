
var array_rows;
var TestArray;
var size;
var datasizes = new Array(4);

    var start = new Date();
    JGFrun(3);
    var elapsed = new Date() - start;

if (JGFvalidate())
    print("PASSED");
else
    print("validation failed");

/**
 * @author ayermolo
 */
function JGFrun(sizelocal)
{
                datasizes[0]= 1000000;
                datasizes[1]= 5000000;
                datasizes[2]=25000000;
        		datasizes[3]= 250000;
                
                JGFsetsize(sizelocal);
                JGFinitialise();
                NumHeapSort();
                JGFvalidate();

}

function JGFvalidate() {
        var error;

        error = false;
        for (var i = 1; i < array_rows; i++) {
                error = (TestArray[i] < TestArray[i - 1]);
                if (error) {
                        print("Validation failed");
                        print("Item " + i + " = " + TestArray[i]);
                        print("Item " + (i - 1) + " = " + TestArray[i - 1]);
                        break;
                }
        }
        return !error;
}

function JGFsetsize(sizelocal)
{
        size = sizelocal;
        
}

function JGFinitialise()
{
        array_rows = datasizes[size];
        buildTestData();
}

function buildTestData()
{
        TestArray = new Array(array_rows);

        //var rndnum = new Random(1729); // Same seed every time.

        // Fill first TestArray with pseudo-random values.

        for (var i = 0; i < array_rows; i++)
        {
                var randomNumber = Math.floor( Math.random() * 1001 );
                TestArray[i]= randomNumber;
        }
}

/*
 * NumHeapSort
 *
 * Sorts one of the int arrays in the array of arrays. This routine performs
 * a heap sort on that array.
 */

function NumHeapSort() {
        var temp; // Used to exchange elements.
        var top = array_rows - 1; // Last index in array. First is zero.

        // First, build a heap in the array. Sifting moves larger
        // values toward bottom of array.

        for (var i = Math.floor( top / 2 ); i > 0; --i)
        {
                NumSift(i, top);
        }
        // Repeatedly extract maximum from heap and place it at the
        // end of the array. When we get done, we'll have a sorted
        // array.

        for (var i = top; i > 0; --i)
        {
                NumSift(0, i);

                // Exchange bottom element with descending top.

                temp = TestArray[0];
                TestArray[0] = TestArray[i];
                TestArray[i] = temp;
        }
}
/*
 * NumSift
 *
 * Performs the sift operation on a numeric array, constructing a heap in
 * the array. Instructions from strsift: Pass this function: 1. The string
 * array # being sorted 2. Offsets within which to sort This performs the
 * core sort of the Heapsort algorithm
 */

function NumSift(min, max) // Sort range offsets.
{
        var k; // Used for index arithmetic.
        var temp; // Used for exchange.

        while ((min + min) <= max) {
                k = min + min;
                if (k < max)
                if (TestArray[k] < TestArray[k + 1])
                                ++k;
                if (TestArray[min] < TestArray[k]) {
                        temp = TestArray[k];
                        TestArray[k] = TestArray[min];
                        TestArray[min] = temp;
                        min = k;
                } else
                        min = max + 1;
        }
}


