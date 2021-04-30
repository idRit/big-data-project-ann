raceResults = read.csv("./results.csv")

plot(raceResults$statusId, raceResults$positionOrder);

ckts = read.csv("./circuits.csv")
races = read.csv("./races.csv");

cktTable <- table(raceResults$raceId)

barplot(cktTable)
plot(cktTable)

constructorStandings = read.csv("./constructor_standings.csv")

plot(races$circuitId, races$year, add=TRUE);
plot(raceResults$constructorId, raceResults$positionOrder);


# Clear plots
dev.off()  # But only if there IS a plot

# Clear console
cat("\014")  # ctrl+L