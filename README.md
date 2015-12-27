##This is a markdown file that explains how the run_analysis.R code works.

This code starts by downloading the necesary zip file, unzipping it, and set the new working directory to the UCI HAR Dataset folder that exists in the zip folder using the file.download and unzip functions. 

We then load the plyr and dplyr packages to allow us to manipulate the data frames using functions like select and aggregate
 
Following that we read in all relevant files - test x/y, train x/y, and subject test/train - into our R environment in order to combine them using read.table to read the file in, cBind to bring together columns of test/train data and rBind to append the rows of the test and train data sets (in that order - read.table, cBind, rBind).   

After doing this we notice that there are 3 columns labled V1. We then proceed to re-name the columns to properly describe the data. Specifically the Subjects, Activity Labels, and Activity Numbers. In preparation for combining all data sets the variable V1 will show up twice. In order to not create any confusion we will first re-label the first one to represent the Activity value from the Y data set. 

doing the same for the Activity Labels files so that our merge will recognize the variable name and default to merging these two columns

since the second variable, V2, also exists in the 'Complete' data set we need to rename that as well 

merge the activity labels into the Complete data set


Appropriately labels the data set with descriptive variable names.
create a vector out of the feature names, add "Act_Num", "Act_Label", and "Subject" to the front end to match the full data set, and combine into a single vector containing the descriptive
change the names of the variables so they are the descriptive lables provided
Remove duplicated columns
select only the columns that contain the mean or standard deviation measurements

From the data set in step 4, creates a second, independent tidy data set with the average of each variable for each activity and each subject.

The result created two group.by column names so we need to clean that up by renaming the Subject and Activity Labels
