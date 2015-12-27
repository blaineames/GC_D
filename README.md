##This is a markdown file that explains how the run_analysis.R code works.

This code starts by downloading the necesary zip file, unzipping it, and set the new working directory to the UCI HAR Dataset folder that exists in the zip folder using the file.download and unzip functions. 

We then load the plyr and dplyr packages to allow us to manipulate the data frames using functions like select and aggregate
 
Following that we read in all relevant files - test x/y, train x/y, and subject test/train - into our R environment in order to combine them using read.table to read the file in, cBind to bring together columns of test/train data and rBind to append the rows of the test and train data sets (in that order - read.table, cBind, rBind).   

We then proceed to re-name the columns to properly describe the data. Specifically, the Subjects, Activity Labels, and Activity Numbers. We do this because we will want to map the Activity Labels to the Numbers using the Activity Lables text file. When we use the merge command we can choose to merge and align by a shared variable - for our purposes this will be a the Activity Number. 

Next we rename all of the variables in the columns. At the moment they are V1-V561. To do this we create a vector out of the feature names, add "Act_Num", "Act_Label", and "Subject" to the front end to match the full data set in the completed, merged file, and combine into a single vector containing the descriptive names. Using the setnames function we are able to re-assign the data frame names using the vectors values created. 

We then notice that there are duplicate variable names so we remove the duplicates to clean up the file. We then use the select command to select only the columns that contain the mean or standard deviation (std) measurements.

As the final step we want to take the average of the Activity Labels by Subject and by Feature. The resulting file is a data table with the average of each activity per subject per activity feature.
