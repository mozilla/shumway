dc = read.table("tamarin.c.run", sep="\t", col.names = c("c.result", "c.id", "c.shu", "c.avm", "c.ratio", "name"))
di = read.table("tamarin.i.run", sep="\t", col.names = c("i.result", "i.id", "i.shu", "i.avm", "i.ratio", "name"))

dx = merge(dc, di)

print (paste("Compiler Failed: ", nrow(subset(dx, c.result == "FAILED")),
             sprintf(", %1.0f%%", (nrow(subset(dx, c.result == "FAILED")) / nrow(dx)) * 100)))


print (paste("Interpreter Failed: ", nrow(subset(dx, i.result == "FAILED")),
             sprintf(", %1.0f%%", (nrow(subset(dx, i.result == "FAILED")) / nrow(dx)) * 100)))

# Select tests that have different results in the compiler vs. interpreter.
print (subset(dx, c.result != i.result))
