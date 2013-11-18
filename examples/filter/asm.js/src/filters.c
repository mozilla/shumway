#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "filters.h"

void preMultiplyAlpha(unsigned char *img, int width, int height)
{
	unsigned char *ptr = img;
	unsigned char *ptrEnd = img + ((width * height) << 2);
	float alpha;
	while (ptr < ptrEnd) {
		alpha = *(ptr + 3) / 255.0;
		if (alpha != 0) {
			*ptr *= alpha;
			*(ptr + 1) *= alpha;
			*(ptr + 2) *= alpha;
		} else {
			*ptr = 0;
			*(ptr + 1) = 0;
			*(ptr + 2) = 0;
		}
		ptr += 4;
	}
}

void unpreMultiplyAlpha(unsigned char *img, int width, int height)
{
	unsigned char *ptr = img;
	unsigned char *ptrEnd = img + ((width * height) << 2);
	float alpha;
	while (ptr < ptrEnd) {
		alpha = *(ptr + 3) / 255.0;
		if (alpha != 0) {
			*ptr /= alpha;
			*(ptr + 1) /= alpha;
			*(ptr + 2) /= alpha;
		} else {
			*ptr = 0;
			*(ptr + 1) = 0;
			*(ptr + 2) = 0;
		}
		ptr += 4;
	}
}

void blur(unsigned char *img, int width, int height, int bx, int by, int quality)
{
	for (int i = 0; i < quality; ++i) {
		blurX(img, width, height, bx);
		blurY(img, width, height, by);
	}
}

void blurX(unsigned char *img, int width, int height, int distance)
{
	if (distance < 1) {
		return;
	}

	unsigned char *src = img;

	int dist2 = distance << 1;
	int dist4 = dist2 << 1;
	int lineSize = width << 2;
	int windowLength = dist2 + 1;
	int windowSize = windowLength << 2;

	unsigned char *lineBuffer = malloc(lineSize);
	memset(lineBuffer, 0, lineSize);

	for (int y = 0; y < height; ++y)
	{
		long rs = 0, gs = 0, bs = 0, as = 0;

		// Fill window
		unsigned char *ptr = src;
		unsigned char *ptrEnd = src + windowSize;
		while (ptr < ptrEnd) {
			rs += *ptr;
			gs += *(ptr + 1);
			bs += *(ptr + 2);
			as += *(ptr + 3);
			ptr += 4;
		}

		// Slide window
		ptr = src + dist4;
		ptrEnd = src + ((width - distance) << 2);
		unsigned char *pLine = lineBuffer + dist4;
		unsigned char *pLast = src;
		unsigned char *pNext = ptr + ((distance + 1) << 2);
		unsigned char alpha;
		while (ptr < ptrEnd) {
			alpha = as / windowLength;
			if (alpha != 0) {
				*(unsigned int *)pLine = (rs / windowLength) | (gs / windowLength) << 8 | (bs / windowLength) << 16 | alpha << 24;
			} else {
				*(unsigned int *)pLine = 0;
			}

			rs += *pNext - *pLast;
			gs += *(pNext + 1) - *(pLast + 1);
			bs += *(pNext + 2) - *(pLast + 2);
			as += *(pNext + 3) - *(pLast + 3);

			ptr += 4;
			pLine += 4;
			pNext += 4;
			pLast += 4;
		}

		// Copy line
		memcpy(src, lineBuffer, lineSize);

		src += lineSize;
	}

	free(lineBuffer);
}

void blurY(unsigned char *img, int width, int height, int distance)
{
	if (distance < 1) {
		return;
	}

	unsigned char *src = img;

	int stride = width << 2;
	int windowLength = (distance << 1) + 1;
	int h4 = height << 2;

	unsigned char *columnBuffer = malloc(h4);
	memset(columnBuffer, 0, h4);

	for (int x = 0; x < width; ++x)
	{
		long rs = 0, gs = 0, bs = 0, as = 0;

		// Fill window
		unsigned char *ptr = src;
		unsigned char *ptrEnd = src + windowLength * stride;
		while (ptr < ptrEnd) {
			rs += *ptr;
			gs += *(ptr + 1);
			bs += *(ptr + 2);
			as += *(ptr + 3);
			ptr += stride;
		}

		// Slide window
		ptr = src + distance * stride;
		ptrEnd = src + (height - distance) * stride;
		unsigned char *pColumn = columnBuffer + (distance << 2);
		unsigned char *pLast = src;
		unsigned char *pNext = ptr + (distance + 1) * stride;
		unsigned char alpha;
		while (ptr < ptrEnd) {
			alpha = as / windowLength;
			if (alpha != 0) {
				*(unsigned int *)pColumn = (rs / windowLength) | (gs / windowLength) << 8 | (bs / windowLength) << 16 | alpha << 24;
			} else {
				*(unsigned int *)pColumn = 0;
			}

			rs += *pNext - *pLast;
			gs += *(pNext + 1) - *(pLast + 1);
			bs += *(pNext + 2) - *(pLast + 2);
			as += *(pNext + 3) - *(pLast + 3);

			ptr += stride;
			pColumn += 4;
			pNext += stride;
			pLast += stride;
		}

		// Copy column
		unsigned int *ptr32 = (unsigned int *)src;
		unsigned int *ptr32End = ptr32 + height * width;
		unsigned int *columnBuffer32 = (unsigned int *)columnBuffer;
		while (ptr32 < ptr32End) {
			*ptr32 = *columnBuffer32;
			ptr32 += width;
			columnBuffer32++;
		}

		src += 4;
	}

	free(columnBuffer);
}

void dropshadow(unsigned char *img, int width, int height, int dx, int dy, unsigned int color, int alpha, int bx, int by, int strength, int quality, unsigned int flags)
{
	int inner = flags & 1;
	int knockout = (flags >> 1) & 1;
	int hideObject = (flags >> 2) & 1;
	int len = width * height;

	unsigned char *tmp = malloc(len << 2);
	memset(tmp, 0, len << 2);

	tint(tmp, img, width, height, color, inner);

	memcpy(img, tmp, len << 2);

	free(tmp);
}

void tint(unsigned char *dst, unsigned char *src, int width, int height, unsigned int color, int invertAlpha)
{
	unsigned char r = (color >> 16) & 0xff;
	unsigned char g = (color >> 8) & 0xff;
	unsigned char b = color & 0xff;

	float af;
	unsigned char ac;
	int i = 0;
	int len = width * height;
	if (invertAlpha) {
		while (i++ < len) {
			ac = *(src + 3);
			if (ac != 0) {
				ac = 255 - ac;
				af = ac / 255.0;
				*dst = r * af;
				*(dst + 1) = g * af;
				*(dst + 2) = b * af;
				*(dst + 3) = ac;
			} else {
				*dst = r;
				*(dst + 1) = g;
				*(dst + 2) = b;
				*(dst + 3) = 0xff;
			}
			dst += 4;
			src += 4;
		}
	} else {
		while (i++ < len) {
			ac = *(src + 3);
			if (ac != 0) {
				af = ac / 255.0;
				*dst = r * af;
				*(dst + 1) = g * af;
				*(dst + 2) = b * af;
				*(dst + 3) = ac;
			}
			dst += 4;
			src += 4;
		}
	}
}

}
