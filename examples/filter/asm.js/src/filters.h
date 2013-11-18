
void preMultiplyAlpha(unsigned char *img, int width, int height);
void unpreMultiplyAlpha(unsigned char *img, int width, int height);

void blur(unsigned char *img, int width, int height, int distX, int distY, int quality);
void blurX(unsigned char *img, int width, int height, int distance);
void blurY(unsigned char *img, int width, int height, int distance);

void dropshadow(unsigned char *img, int width, int height, int dx, int dy, unsigned int color, int alpha, int bx, int by, int strength, int quality, unsigned int flags);
void pan(unsigned char *dst, unsigned char *src, int width, int height, int dx, int dy);
void tint(unsigned char *dst, unsigned char *src, int width, int height, unsigned int color, int invertAlpha);
