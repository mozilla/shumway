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

	int dist4 = distance << 2;
	int dist8 = distance << 3;
	int lineOutSize = width << 2;
	int lineInSize = lineOutSize + dist8; // (distance * 2) + width
	int windowLength = (distance << 1) + 1; // (distance * 2) + 1

	unsigned char *lineBufferIn = malloc(lineInSize);
	memset(lineBufferIn, 0, lineInSize);

	for (int y = 0; y < height; ++y) {
		memcpy(lineBufferIn + dist8, src + dist4, lineOutSize - dist8);
		boxBlur((unsigned int *)src, lineBufferIn, width, windowLength);
		src += lineOutSize;
	}

	free(lineBufferIn);
}

void blurY(unsigned char *img, int width, int height, int distance)
{
	if (distance < 1) {
		return;
	}

	unsigned char *src = img;

	int dist2 = distance << 1;
	int lineOutSize = height << 2;
	int lineInSize = lineOutSize + (distance << 3); // (height + (distance * 2)) * 4
	int windowLength = dist2 + 1; // (distance * 2) + 1

	unsigned char *lineBufferIn = malloc(lineInSize);
	memset(lineBufferIn, 0, lineInSize);

	unsigned char *lineBufferOut = malloc(lineOutSize);
	memset(lineBufferOut, 0, lineOutSize);

	unsigned int *src32;
	unsigned int *line32;
	int srcOffs = distance * width;
	int x, y;

	for (x = 0; x < width; ++x) {
		src32 = (unsigned int *)src + srcOffs;
		line32 = (unsigned int *)lineBufferIn + dist2;
		for (y = 0; y < height - dist2; ++y) {
			*line32++ = *src32;
			src32 += width;
		}

		boxBlur((unsigned int *)lineBufferOut, lineBufferIn, height, windowLength);

		src32 = (unsigned int *)src;
		line32 = (unsigned int *)lineBufferOut;
		for (y = 0; y < height; ++y) {
			*src32 = *line32++;
			src32 += width;
		}

		src += 4;
	}

	free(lineBufferOut);
	free(lineBufferIn);
}

void boxBlur(unsigned int *lineBufferOut, unsigned char *lineBufferIn, int width, int windowLength)
{
	int windowSize = windowLength << 2;

	// Init window
	unsigned char *ptr = lineBufferIn + windowSize - 4;
	long rs = *ptr;
	long gs = *(ptr + 1);
	long bs = *(ptr + 2);
	long as = *(ptr + 3);

	// Slide window
	unsigned char *pLast = lineBufferIn;
	unsigned char *pNext = lineBufferIn + windowSize;
	unsigned char alpha;
	for (int x = 0; x < width; ++x) {
		alpha = as / windowLength;
		if (alpha != 0) {
			*lineBufferOut = (rs / windowLength) | (gs / windowLength) << 8 | (bs / windowLength) << 16 | alpha << 24;
		} else {
			*lineBufferOut = 0;
		}

		rs += *pNext - *pLast;
		gs += *(pNext + 1) - *(pLast + 1);
		bs += *(pNext + 2) - *(pLast + 2);
		as += *(pNext + 3) - *(pLast + 3);

		pNext += 4;
		pLast += 4;
		lineBufferOut++;
	}
}

void dropshadow(unsigned char *img, int width, int height, int dx, int dy, unsigned int color, int alpha, int bx, int by, int strength, int quality, unsigned int flags)
{
	int inner = flags & 1;
	int knockout = (flags >> 1) & 1;
	int hideObject = (flags >> 2) & 1;
	int len = width * height;

	unsigned char *tmp = malloc(len << 2);
	memset(tmp, 0, len << 2);

	pan(tmp, img, width, height, dx, dy);
	tint(tmp, tmp, width, height, color, inner);

	memcpy(img, tmp, len << 2);

	free(tmp);
}

void pan(unsigned char *dst, unsigned char *src, int width, int height, int dx, int dy)
{
	if (dx == 0 && dy == 0) {
		if (dst != src) {
			memcpy(dst, src, width * height * 4);
		}
		return;
	}

	unsigned int *psrc = (unsigned int *)src;
	unsigned int *pdst = (unsigned int *)dst;
	int w = width - abs(dx);
	int h = height - abs(dy);
	if (dx > 0) { pdst += dx; }
	if (dy > 0) { pdst += dy * width; }
	if (dx < 0) { psrc -= dx; }
	if (dy < 0) { psrc -= dy * width; }
	if (pdst <= psrc) {
		for (int y = 0; y < h; ++y) {
			for (int x = 0; x < w; ++x) {
				*(pdst + x) = *(psrc + x);
			}
			pdst += width;
			psrc += width;
		}
	} else {
		int end = width * (h - 1);
		psrc += end;
		pdst += end;
		w--; h--;
		for (int y = h; y >= 0; --y) {
			for (int x = w; x >= 0; --x) {
				*(pdst + x) = *(psrc + x);
			}
			pdst -= width;
			psrc -= width;
		}
	}
}

void tint(unsigned char *dst, unsigned char *src, int width, int height, unsigned int color, int invertAlpha)
{
	unsigned int *dst32 = (unsigned int *)dst;
	unsigned int *end32 = dst32 + (width * height);

	unsigned char r = (color >> 16) & 0xff;
	unsigned char g = (color >> 8) & 0xff;
	unsigned char b = color & 0xff;
	unsigned int bgr = r | g << 8 | b << 16 | 0xff000000;

	float af;
	unsigned char ac;

	src += 3;
	if (invertAlpha) {
		while (dst32 < end32) {
			ac = *src;
			if (ac == 0) {
				*dst32 = bgr;
			} else if (ac < 255) {
				ac = 255 - ac;
				af = ac / 255.0;
				*dst32 = (int)(r * af) | (int)(g * af) << 8 | (int)(b * af) << 16 | ac << 24;
			} else {
				*dst32 = 0;
			}
			dst32++;
			src += 4;
		}
	} else {
		while (dst32 < end32) {
			ac = *src;
			if (ac == 255) {
				*dst32 = bgr;
			} else if (ac > 0) {
				af = ac / 255.0;
				*dst32 = (int)(r * af) | (int)(g * af) << 8 | (int)(b * af) << 16 | ac << 24;
			} else {
				*dst32 = 0;
			}
			dst32++;
			src += 4;
		}
	}
}
