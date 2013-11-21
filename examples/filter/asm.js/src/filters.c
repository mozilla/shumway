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

void blur(unsigned char *img, int width, int height, int bx, int by, int quality, unsigned int borderColor)
{
	unsigned int abgrBorderColor = 0;
	if (borderColor != 0) {
		unsigned char r = (borderColor >> 16) & 0xff;
		unsigned char g = (borderColor >> 8) & 0xff;
		unsigned char b = borderColor & 0xff;
		abgrBorderColor = r | g << 8 | b << 16 | 0xff000000;
	}
	for (int i = 0; i < quality; ++i) {
		blurX(img, width, height, bx, abgrBorderColor);
		blurY(img, width, height, by, abgrBorderColor);
	}
}

void blurX(unsigned char *img, int width, int height, int distance, unsigned int borderColor)
{
	if (distance < 1) {
		return;
	}

	unsigned char *src = img;

	int dist2 = distance << 1;
	int dist4 = distance << 2;
	int dist8 = distance << 3;
	int lineOutSize = width << 2;
	int lineInSize = lineOutSize + dist8; // (distance * 2) + width
	int windowLength = dist2 + 1; // (distance * 2) + 1

	unsigned char *lineBufferIn = malloc(lineInSize);
	unsigned int *pBorderLeft = (unsigned int *)lineBufferIn;
	unsigned int *pBorderRight = (unsigned int *)(lineBufferIn + lineInSize - 4);
	for (int i = 0; i < dist2; ++i) {
		*pBorderLeft = borderColor;
		*pBorderRight = borderColor;
		pBorderLeft++;
		pBorderRight--;
	}

	for (int y = 0; y < height; ++y) {
		memcpy(lineBufferIn + dist8, src + dist4, lineOutSize - dist8);
		boxBlur((unsigned int *)src, lineBufferIn, width, windowLength);
		src += lineOutSize;
	}

	free(lineBufferIn);
}

void blurY(unsigned char *img, int width, int height, int distance, unsigned int borderColor)
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
	unsigned int *pBorderTop = (unsigned int *)lineBufferIn;
	unsigned int *pBorderBottom = (unsigned int *)(lineBufferIn + lineInSize - 4);
	for (int i = 0; i < dist2; ++i) {
		*pBorderTop++ = borderColor;
		*pBorderBottom = borderColor;
		pBorderTop++;
		pBorderBottom--;
	}

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
	long rs = 0, gs = 0, bs = 0, as = 0;

	// Init window
	unsigned char *ptr = lineBufferIn;
	unsigned char *ptrEnd = lineBufferIn + windowSize;
	while (ptr < ptrEnd) {
		rs += *ptr;
		gs += *(ptr + 1);
		bs += *(ptr + 2);
		as += *(ptr + 3);
		ptr += 4;
	}

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

void dropshadow(unsigned char *img, int width, int height, int dx, int dy, unsigned int color, int alpha, int bx, int by, double strength, int quality, unsigned int flags)
{
	int inner = flags & 1;
	int knockout = (flags >> 1) & 1;
	int hideObject = (flags >> 2) & 1;
	int len = width * height;

	unsigned char *tmp = malloc(len << 2);
	memset(tmp, 0, len << 2);

	pan(tmp, img, width, height, dx, dy);
	tint(tmp, tmp, width, height, color, inner);
	blur(tmp, width, height, bx, by, quality, (inner == 1) ? (color | 0xff000000) : 0);
	scaleAlpha(tmp, width, height, strength);

	if (inner == 1) {
		if (knockout == 0 && hideObject == 0) {
			compositeDestinationAtop(tmp, img, width, height);
		} else {
			compositeDestinationIn(tmp, img, width, height);
		}
		memcpy(img, tmp, len << 2);
	} else {
		if (knockout == 1) {
			compositeSourceOut(img, tmp, width, height);
		} else if (hideObject == 1) {
			memcpy(img, tmp, len << 2);
		} else {
			compositeDestinationOver(img, tmp, width, height);
		}
	}

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

void scaleAlpha(unsigned char *img, int width, int height, double strength)
{
	if (strength == 1.0) {
		return;
	}

	unsigned char *imgEnd = img + ((width * height) << 2);

	unsigned int *img32 = (unsigned int *)img;

	int r, g, b, a;
	float rr, rg, rb, ra;
	float mult;

	while (img < imgEnd) {
		ra = *(img + 3);
		if (ra == 0) {
			*img32++ = 0;
		} else {
			a = ra * strength;
			a = clamp(a);
			if (a == ra) {
				*img32++ = *img | *(img + 1) << 8 | *(img + 2) << 16 | a << 24;
			} else {
				mult = a / ra;
				rr = *img * mult;
				rg = *(img + 1) * mult;
				rb = *(img + 2) * mult;
				*img32++ = clamp(rr) | clamp(rg) << 8 | clamp(rb) << 16 | a << 24;
			}
		}
		img += 4;
	}
}

// TODO: REVIST
void compositeSourceOver(unsigned char *dst, unsigned char *src, int width, int height)
{
	unsigned char *end = src + ((width * height) << 2);

	unsigned int *dst32 = (unsigned int *)dst;

	int dr, dg, db;
	int sr, sg, sb;
	double da;
	double sa;
	double sa_inv;

	while (src < end) {
		sr = *src;
		sg = *(src + 1);
		sb = *(src + 2);
		sa = *(src + 3) / 255.0;
		sa_inv = 1.0 - sa;
		dr = *dst;
		dg = *(dst + 1);
		db = *(dst + 2);
		da = *(dst + 3) / 255.0;
		*dst32++ =
			(int)(sr + dr * sa_inv) |
			(int)(sg + dg * sa_inv) << 8 |
			(int)(sb + db * sa_inv) << 16 |
			(int)((sa + da * sa_inv) * 255.0) << 24;
		src += 4;
		dst += 4;
	}
}

// TODO: REVIST
void compositeDestinationOver(unsigned char *dst, unsigned char *src, int width, int height)
{
	unsigned char *end = src + ((width * height) << 2);

	unsigned int *dst32 = (unsigned int *)dst;

	int dr, dg, db;
	int sr, sg, sb;
	double sa;
	double da;
	double da_inv;

	while (src < end) {
		sr = *src;
		sg = *(src + 1);
		sb = *(src + 2);
		sa = *(src + 3) / 255.0;
		dr = *dst;
		dg = *(dst + 1);
		db = *(dst + 2);
		da = *(dst + 3) / 255.0;
		da_inv = 1.0 - da;
		*dst32++ =
			(int)(dr + sr * da_inv) |
			(int)(dg + sg * da_inv) << 8 |
			(int)(db + sb * da_inv) << 16 |
			(int)((da + sa * da_inv) * 255.0) << 24;
		src += 4;
		dst += 4;
	}
}

// TODO: REVIST
void compositeSourceIn(unsigned char *dst, unsigned char *src, int width, int height)
{
	unsigned char *end = src + ((width * height) << 2);

	unsigned int *dst32 = (unsigned int *)dst;

	int dr, dg, db;
	int sr, sg, sb;
	double sa;
	double da;
	double da_inv;

	while (src < end) {
		sr = *src;
		sg = *(src + 1);
		sb = *(src + 2);
		sa = *(src + 3) / 255.0;
		da = *(dst + 3) / 255.0;
		da_inv = 1.0 - da;
		*dst32++ =
			(int)(sa * sr * da) |
			(int)(sa * sg * da) << 8 |
			(int)(sa * sb * da) << 16 |
			(int)((sa * da) * 255.0) << 24;
		src += 4;
		dst += 4;
	}
}

void compositeDestinationIn(unsigned char *dst, unsigned char *src, int width, int height)
{
	unsigned char *end = src + ((width * height) << 2);

	unsigned int *dst32 = (unsigned int *)dst;

	int d, s;
	float rr, rg, rb, ra;
	float da;
	float sa;

	while (src < end) {
		d = *(dst + 3);
		if (d == 0) {
			*dst32++ = 0;
		} else {
			s = *(src + 3);
			if (s == 0) {
				*dst32++ = 0;
			} else {
				da = d / 255.0;
				sa = s / 255.0;
				rr = *dst       * sa;
				rg = *(dst + 1) * sa;
				rb = *(dst + 2) * sa;
				ra = (da * sa) * 255.0;
				*dst32++ = clamp(rr) | clamp(rg) << 8 | clamp(rb) << 16 | clamp(ra) << 24;
			}
		}
		src += 4;
		dst += 4;
	}
}

void compositeSourceOut(unsigned char *dst, unsigned char *src, int width, int height)
{
	unsigned char *end = src + ((width * height) << 2);

	unsigned int *dst32 = (unsigned int *)dst;

	int d, s;
	float da_inv;

	while (src < end) {
		d = *(dst + 3);
		if (d == 0) {
			*dst32++ = *(unsigned int *)src;
		} else {
			s = *(src + 3);
			if (s == 0) {
				*dst32++ = 0;
			} else {
				da_inv = 1 - d / 255.0;
				*dst32++ =
					(int)(*src * da_inv) |
					(int)(*(src + 1) * da_inv) << 8 |
					(int)(*(src + 2) * da_inv) << 16 |
					(int)(s * da_inv) << 24;
			}
		}
		src += 4;
		dst += 4;
	}
}

// TODO: REVIST
void compositeDestinationOut(unsigned char *dst, unsigned char *src, int width, int height)
{
	unsigned char *end = src + ((width * height) << 2);

	unsigned int *dst32 = (unsigned int *)dst;

	int dr, dg, db;
	int sr, sg, sb;
	double da;
	double sa;
	double sa_inv;

	while (src < end) {
		dr = *dst;
		dg = *(dst + 1);
		db = *(dst + 2);
		da = *(dst + 3) / 255.0;
		sa = *(src + 3) / 255.0;
		sa_inv = 1.0 - sa;
		*dst32++ =
			(int)(da * dr * sa_inv) |
			(int)(da * dg * sa_inv) << 8 |
			(int)(da * db * sa_inv) << 16 |
			(int)((da * sa_inv) * 255.0) << 24;
		src += 4;
		dst += 4;
	}
}

void compositeDestinationAtop(unsigned char *dst, unsigned char *src, int width, int height)
{
	unsigned char *end = src + ((width * height) << 2);

	unsigned int *dst32 = (unsigned int *)dst;

	int d, s;
	float rr, rg, rb, ra;
	float da, da_inv;
	float sa;

	while (src < end) {
		d = *(dst + 3);
		if (d == 0) {
			*dst32++ = *(unsigned int *)src;
		} else {
			s = *(src + 3);
			if (s == 0) {
				*dst32++ = 0;
			} else {
				sa = s / 255.0;
				da = d / 255.0;
				da_inv = (1.0 - da);
				rr = *src       * da_inv + *dst       * sa;
				rg = *(src + 1) * da_inv + *(dst + 1) * sa;
				rb = *(src + 2) * da_inv + *(dst + 2) * sa;
				ra = (sa * da_inv + da * sa) * 255.0;
				*dst32++ = clamp(rr) | clamp(rg) << 8 | clamp(rb) << 16 | clamp(ra) << 24;
			}
		}
		src += 4;
		dst += 4;
	}
}

void colormatrix(unsigned char *img, int width, int height, float *m)
{
	unsigned char *imgEnd = img + ((width * height) << 2);

	unsigned int *img32 = (unsigned int *)img;

	int r, g, b, a;
	float rr, rg, rb, ra;

	while (img < imgEnd) {
		r = *img;
		g = *(img + 1);
		b = *(img + 2);
		a = *(img + 3);
		rr = r * m[ 0] + g * m[ 1] + b * m[ 2] + a * m[ 3] + m[ 4];
		rg = r * m[ 5] + g * m[ 6] + b * m[ 7] + a * m[ 8] + m[ 9];
		rb = r * m[10] + g * m[11] + b * m[12] + a * m[13] + m[14];
		ra = r * m[15] + g * m[16] + b * m[17] + a * m[18] + m[19];
		*img32++ = clamp(rr) | clamp(rg) << 8 | clamp(rb) << 16 | clamp(ra) << 24;
		img += 4;
	}
}
