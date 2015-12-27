##This is R code used to create a tidy data set for the Coursera Data Science course
##Getting and Cleaning Data

#Set Working Directory to a folder that you can download the zip file to 
setwd("~/Desktop/DataScience/Data")

#Download file, unzip, and set the new working directory to the UCI HAR Dataset
fileurl <- "https://d396qusza40orc.cloudfront.net/getdata%2Fprojectfiles%2FUCI%20HAR%20Dataset.zip"
download.file(fileurl, destfile = "HumanActivity.zip")
unzip("HumanActivity.zip")
setwd("./UCI HAR Dataset")

#load necessary packages for data manipulation
library(plyr)   #initiate the PLYR package to allow Join commands
library(dplyr)  #initiate the DPLYR package to allow data frame manipulation   

#Read in all relevant files

act_lbls <- read.table("activity_labels.txt")
features <- read.table("features.txt")

setwd("./test")
Xtest <- read.table("X_test.txt")
Ytest <- read.table("y_test.txt")
SubjTest <- read.table("subject_test.txt")

setwd("../train")
Xtrain <- read.table("X_train.txt")
Ytrain <- read.table("y_train.txt")
SubjTrain <- read.table("subject_train.txt")

#Merges the training and the test sets to create one data set.

Train <- cbind(SubjTrain, Ytrain, Xtrain)      #combine the training sets
Test <- cbind(SubjTest, Ytest, Xtest)         #combine the test sets
Complete <- rbind(Test, Train)      #combine both the training and test sets to create one complete data set

#Uses descriptive activity names to name the activities in the data set

colnames(Complete)[1] <- "Subject" #Re-naming columns to properly describe the data
colnames(Complete)[2] <- "Act_Num" #In preparation for combining all data sets the variable V1 will show up twice. In order to not create any confusion we will first re-label the first one to represent the Activity value from the Y data set. 
colnames(act_lbls)[1] <- "Act_Num" #doing the same for the Activity Labels files so that our merge will recognize the variable name and default to merging these two columns
colnames(act_lbls)[2] <- "Act_Label"    #since the second variable, V2, also exists in the 'Complete' data set we need to rename that as well 
Complete_Merged <- merge(act_lbls, Complete, by = "Act_Num") #merge the activity labels into the Complete data set


#Appropriately labels the data set with descriptive variable names.

fNames <- c("Act_Num","Act_Label","Subject", as.vector(features[ ,2]))  #create a vector out of the feature names, 
                                                              #add "Act_Num", "Act_Label", and "Subject" to the front end to match the full data set, and
                                                              #combine into a single vector containing the descriptive Activity Labels

Act_Comp <- setNames(Complete_Merged, fNames)  #change the names of the variables so they are the descriptive lables provided

Act_Comp <- Act_Comp[ ,!duplicated(colnames(Act_Comp))] #Remove duplicated columns

MeanStd_ActDat <- select(Act_Comp, 
                        matches("Act_Num"), 
                        matches("Act_Label"),
                        matches("Subject"),
                        contains("mean"), 
                        contains("std"))   #select only the columns that contain the mean or standard deviation measurements

#From the data set in step 4, creates a second, independent tidy data set with the average of each variable for each activity and each subject.
Avg_MeanStd_ActDat <- aggregate(MeanStd_ActDat[,4:89], 
                                by=list(MeanStd_ActDat$Subject, MeanStd_ActDat$Act_Label), 
                                mean)

#The result created two group.by column names so we need to clean that up by renaming the Subject and Activity Labels
colnames(Avg_MeanStd_ActDat)[2] <- "Act_Label"
colnames(Avg_MeanStd_ActDat)[1] <- "Subject"

print(Avg_MeanStd_ActDat)
