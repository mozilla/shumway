
#define min(a,b) ((a) <= (b) ? (a) : (b))

#define clamp(n) (int)((n) > 0xff ? 0xff : ((n) < 0 ? 0 : (n)))

void preMultiplyAlpha(unsigned char *img, int width, int height);
void unpreMultiplyAlpha(unsigned char *img, int width, int height);

void blur(unsigned char *img, int width, int height, int distX, int distY, int quality, unsigned int borderColor);
void blurX(unsigned char *img, int width, int height, int distance, unsigned int borderColor);
void blurY(unsigned char *img, int width, int height, int distance, unsigned int borderColor);
void boxBlur(unsigned int *lineBufferOut, unsigned char *lineBufferIn, int width, int windowLength);

void dropshadow(unsigned char *img, int width, int height, int dx, int dy, unsigned int color, int alpha, int bx, int by, double strength, int quality, unsigned int flags);
void pan(unsigned char *dst, unsigned char *src, int width, int height, int dx, int dy);
void tint(unsigned char *dst, unsigned char *src, int width, int height, unsigned int color, int invertAlpha);
void scaleAlpha(unsigned char *img, int width, int height, double strength);

void colormatrix(unsigned char *img, int width, int height, float *m);

void compositeSourceOver(unsigned char *dst, unsigned char *src, int width, int height);
void compositeDestinationOver(unsigned char *dst, unsigned char *src, int width, int height);
void compositeSourceIn(unsigned char *dst, unsigned char *src, int width, int height);
void compositeDestinationIn(unsigned char *dst, unsigned char *src, int width, int height);
void compositeSourceOut(unsigned char *dst, unsigned char *src, int width, int height);
void compositeDestinationOut(unsigned char *dst, unsigned char *src, int width, int height);
void compositeDestinationAtop(unsigned char *dst, unsigned char *src, int width, int height);
