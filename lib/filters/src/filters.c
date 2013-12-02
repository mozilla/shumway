#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "filters.h"

void preMultiplyAlpha(unsigned char *img, int width, int height)
{
	unsigned char *ptr = img;
	unsigned char *ptrEnd = img + ((width * height) << 2);
	unsigned char ac;
	float a;
	while (ptr < ptrEnd) {
		ac = *(ptr + 3);
		if (ac != 0) {
			a = ac / 255.0;
			*ptr *= a;
			*(ptr + 1) *= a;
			*(ptr + 2) *= a;
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
	unsigned char ac;
	float a;
	while (ptr < ptrEnd) {
		ac = *(ptr + 3);
		if (ac != 0) {
			a = ac / 255.0;
			*ptr /= a;
			*(ptr + 1) /= a;
			*(ptr + 2) /= a;
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
		*pBorderLeft++ = borderColor;
		*pBorderRight-- = borderColor;
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
		*pBorderBottom-- = borderColor;
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

void blurAlpha(unsigned char *img, int width, int height, int bx, int by, int quality, unsigned char borderAlpha, int rx, int ry, int rw, int rh)
{
	int bxTotal = bx * (quality - 1);
	int byTotal = by * (quality - 1);
	rx += bxTotal;
	ry += byTotal;
	rw -= bxTotal << 1;
	rh -= byTotal << 1;
	for (int i = 0; i < quality; ++i) {
		blurXAlpha(img, width, height, bx, borderAlpha, rx, ry, rw, rh);
		blurYAlpha(img, width, height, by, borderAlpha, rx, ry, rw, rh);
		rx -= bx;
		ry -= by;
		rw += bx << 1;
		rh += by << 1;
	}
}

void blurXAlpha(unsigned char *img, int width, int height, int distance, unsigned char borderAlpha, int rx, int ry, int rw, int rh)
{
	if (distance < 1) {
		return;
	}

	unsigned char *src = img + (ry * width) + rx;

	int dist2 = distance << 1;
	int windowLength = dist2 + 1;

	unsigned char *lineBufferIn = malloc(rw + dist2);
	memset(lineBufferIn, borderAlpha, dist2);
	memset(lineBufferIn + rw, borderAlpha, dist2);

	for (int y = 0; y < rh; ++y) {
		memcpy(lineBufferIn + dist2, src + distance, rw - dist2);
		boxBlurAlpha(src, lineBufferIn, rw, windowLength);
		src += width;
	}

	free(lineBufferIn);
}

void blurYAlpha(unsigned char *img, int width, int height, int distance, unsigned char borderAlpha, int rx, int ry, int rw, int rh)
{
	if (distance < 1) {
		return;
	}

	unsigned char *src = img + (ry * width) + rx;

	int dist2 = distance << 1;
	int windowLength = dist2 + 1;

	unsigned char *lineBufferIn = malloc(rh + dist2);
	memset(lineBufferIn, borderAlpha, dist2);
	memset(lineBufferIn + rh, borderAlpha, dist2);

	unsigned char *lineBufferOut = malloc(rh);
	memset(lineBufferOut, 0, rh);

	unsigned char *psrc;
	unsigned char *pline;
	int srcOffs = distance * width;
	int x, y;

	for (x = 0; x < rw; ++x) {
		psrc = src + srcOffs;
		pline = lineBufferIn + dist2;
		for (y = 0; y < rh - dist2; ++y) {
			*pline++ = *psrc;
			psrc += width;
		}

		boxBlurAlpha(lineBufferOut, lineBufferIn, rh, windowLength);

		psrc = src;
		pline = lineBufferOut;
		for (y = 0; y < rh; ++y) {
			*psrc = *pline++;
			psrc += width;
		}

		src++;
	}

	free(lineBufferOut);
	free(lineBufferIn);
}

void boxBlurAlpha(unsigned char *lineBufferOut, unsigned char *lineBufferIn, int width, int windowLength)
{
	unsigned long as = 0;

	// Init window
	unsigned char *ptr = lineBufferIn;
	unsigned char *ptrEnd = lineBufferIn + windowLength;
	while (ptr < ptrEnd) {
		as += *ptr++;
	}

	// Slide window
	unsigned char *pLast = lineBufferIn;
	unsigned char *pNext = lineBufferIn + windowLength;
	for (int x = 0; x < width; ++x) {
		*lineBufferOut++ = as / windowLength;
		as += *pNext++ - *pLast++;
	}
}

void dropshadow(unsigned char *img, int width, int height, int dx, int dy, unsigned int color, int alpha, int bx, int by, double strength, int quality, unsigned int flags)
{
	int inner = flags & 1;
	int knockout = (flags >> 1) & 1;
	int hideObject = (flags >> 2) & 1;
	int size = width * height;
	int size4 = size << 2;
	int i;

	unsigned char defaultalpha = (inner == 1) ? 0xff : 0;

	unsigned char *tmp = malloc(size4);
	memset(tmp, defaultalpha, size);

	// Copy img's alpha channel to tmp, offset by dx/dy
	unsigned char *ptmp = tmp;
	unsigned char *pimg = img + 3;
	if (dx == 0 && dy == 0) {
		// No offset: just copy
		if (inner == 1) {
			for (i = 0; i < size; ++i) {
				*ptmp++ = 255 - *pimg;
				pimg += 4;
			}
		} else {
			for (i = 0; i < size; ++i) {
				*ptmp++ = *pimg;
				pimg += 4;
			}
		}
	} else {
		int w = width - abs(dx);
		int h = height - abs(dy);
		int width4 = width << 2;
		int x, x4, y;
		if (dx > 0) {
			ptmp += dx;
		} else {
			pimg -= dx * 4;
		}
		if (dy > 0) {
			ptmp += dy * width;
		} else {
			pimg -= dy * width * 4;
		}
		if (inner == 1) {
			for (y = 0; y < h; ++y) {
				for (x = 0, x4 = 0; x < w; ++x, x4 += 4) {
					*(ptmp + x) = 255 - *(pimg + x4);
				}
				ptmp += width;
				pimg += width4;
			}
		} else {
			for (y = 0; y < h; ++y) {
				for (x = 0, x4 = 0; x < w; ++x, x4 += 4) {
					*(ptmp + x) = *(pimg + x4);
				}
				ptmp += width;
				pimg += width4;
			}
		}
	}

	// Blur the alpha channel
	blurAlpha(tmp, width, height, bx, by, quality, defaultalpha, 0, 0, width, height);

	// Tint and multiply strength
	unsigned char r = (color >> 16) & 0xff;
	unsigned char g = (color >> 8) & 0xff;
	unsigned char b = color & 0xff;
	unsigned int bgr = r | g << 8 | b << 16 | 0xff000000;
	float af;
	unsigned long ac;
	unsigned int *ptmp32 = (unsigned int *)tmp + size - 1;
	ptmp = tmp + size;
	while (--ptmp >= tmp) {
		ac = *ptmp * strength;
		if (ac >= 255) {
			*ptmp32-- = bgr;
		} else if (ac > 0) {
			af = ac / 255.0;
			*ptmp32-- = (int)(r * af) | (int)(g * af) << 8 | (int)(b * af) << 16 | ac << 24;
		} else {
			*ptmp32-- = 0;
		}
	}

	// Composite shadow with image
	if (inner == 1) {
		if (knockout == 0 && hideObject == 0) {
			compositeSourceAtop(img, tmp, width, height);
		} else {
			compositeSourceIn(img, tmp, width, height);
		}
	} else {
		if (knockout == 1) {
			compositeSourceOut(img, tmp, width, height);
		} else if (hideObject == 1) {
			memcpy(img, tmp, size4);
		} else {
			compositeDestinationOver(img, tmp, width, height);
		}
	}

	free(tmp);
}

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

void compositeSourceIn(unsigned char *dst, unsigned char *src, int width, int height)
{
	unsigned char *end = src + ((width * height) << 2);

	unsigned int *dst32 = (unsigned int *)dst;

	int d, s;
	float rr, rg, rb, ra;
	float da;

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
				rr = *src       * da;
				rg = *(src + 1) * da;
				rb = *(src + 2) * da;
				ra = da * s;
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

void compositeSourceAtop(unsigned char *dst, unsigned char *src, int width, int height)
{
	unsigned char *end = src + ((width * height) << 2);

	unsigned int *dst32 = (unsigned int *)dst;

	int d, s;
	float rr, rg, rb, ra;
	float sa, sa_inv;
	float da;

	while (src < end) {
		d = *(dst + 3);
		if (d == 0) {
			*dst32++ = 0;
		} else {
			s = *(src + 3);
			if (s == 0) {
				dst32++;
			} else {
				da = d / 255.0;
				sa = s / 255.0;
				sa_inv = (1.0 - sa);
				rr = *src       * da + *dst       * sa_inv;
				rg = *(src + 1) * da + *(dst + 1) * sa_inv;
				rb = *(src + 2) * da + *(dst + 2) * sa_inv;
				ra = (sa * da + da * sa_inv) * 255.0;
				*dst32++ = clamp(rr) | clamp(rg) << 8 | clamp(rb) << 16 | clamp(ra) << 24;
			}
		}
		src += 4;
		dst += 4;
	}
}

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

void compositeDestinationIn(unsigned char *dst, unsigned char *src, int width, int height)
{
	unsigned char *end = src + ((width * height) << 2);

	unsigned int *dst32 = (unsigned int *)dst;

	int d, s;
	float rr, rg, rb, ra;
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
				sa = s / 255.0;
				rr = *dst       * sa;
				rg = *(dst + 1) * sa;
				rb = *(dst + 2) * sa;
				ra = d * sa;
				*dst32++ = clamp(rr) | clamp(rg) << 8 | clamp(rb) << 16 | clamp(ra) << 24;
			}
		}
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
			*dst32++ = 0;
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
