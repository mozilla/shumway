#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "alpha.h"

void preMultiplyAlpha(unsigned char *img, int width, int height)
{
	unsigned char *ptr = img;
	unsigned char *ptrEnd = img + ((width * height) << 2);
	float alpha;
	while (ptr < ptrEnd) {
		alpha = *(ptr + 3) / 255.0;
		*ptr *= alpha;
		*(ptr + 1) *= alpha;
		*(ptr + 2) *= alpha;
		ptr += 4;
	}
}

void preMultiplyAlphaUndo(unsigned char *img, int width, int height)
{
	unsigned char *ptr = img;
	unsigned char *ptrEnd = img + ((width * height) << 2);
	float alpha;
	while (ptr < ptrEnd) {
		alpha = *(ptr + 3) / 255.0;
		*ptr /= alpha;
		*(ptr + 1) /= alpha;
		*(ptr + 2) /= alpha;
		ptr += 4;
	}
}
