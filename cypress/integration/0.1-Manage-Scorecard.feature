Feature: Manage Scorecard

  As Hussein, a user with privilege access at national level,
  I would like to be able to manage scorecard for selected set of indicators
  so that managers at national and subnational levels can access


  @focus
  Scenario: Create Scorecard
    Given authorized user at national level
    When opening scorecard form
    And providing general scorecard details
    And configuring indicator groups details
    And configuring indicator data details
    Then scorecard should be saved and be available in the list

  @focus
  Scenario: Assign Indicators to groups
    Given authorized user at national level
    When opening scorecard form
    And configuring indicator groups details
    And creating data groups
    And selecting to view available indicators
    And selecting an indicator group
    And adding an indicator to a data group
    And configuring indicator data details
    Then the configured indicator should be displayed in the specific data group on the scorecard visualization

  @focus
  Scenario: Creating/updating Scorecard header
    Given authorized user at national level
    When opening scorecard form
    And editing scorecard header
    Then the changes on the scorecard header should be visible

 @focus
  Scenario: Creating/updating Scorecard legends
    Given authorized user at national level
    When opening scorecard form
    And editing scorecard legends
    Then the changes on the scorecard legends should be visible


  @focus
  Scenario: Pair Indicators
    Given authorized user at national level
    When opening scorecard form
    And configuring indicator groups details
    And selecting indicators
    And selecting an indicator group
    And selecting an indicator
    And configuring indicator data details
    And selecting pair with another indicator
    And selecting an indicator to pair with
    Then the configured indicator should be displayed with the paired indicator on the same column  on the scorecard visualization

  @focus
  Scenario: Sharing Scorecard to user groups
    Given authorized coordinator
    When Creating/updating scorecard
    And selecting to share with a specific user group and saving the changes
    Then the users in the specific user group should be able to access the scorecard

  @focus
  Scenario: Configure legends for indicators
    Given authorized coordinator
    When adding indicators to a scorecard
    And configuring maximum and minimum values for predefined legend values and saving the changes
    Then the changes on the legend values should be reflected in the scorecard

  @focus
  Scenario: Assigning different nature of data to scorecard
  Given authorized coordinator
  When Creating/Updating scorecard
  And selecting aggregate data group
  And selecting aggregate data type
  And configuring the data properties and saving the changes
  Then the configured aggregate data should be reflected on the scorecard

  @focus
  Scenario: Deleting Scorecard
    Given  authorized coordinator
    When deleting scorecard
    And confirming to delete scorecard
    Then the deleted scorecard should not be on the list
  
  @focus 
  Scenario: Accessing Settings of a specific target
  Given authorized user at national level
  When opening scorecard form
  And selecting specific indicator
  And selecting specific target
  Then a button of target library should be displayed

  @focus
  Scenario: Setting of a specific target by period
  Given authorized user at national level
  When opening scorecard form
  And selecting specific indicator
  And selecting target by period
  And click specific target library button
  Then a page with configured period target should appear


  @focus
  Scenario: Setting of a specific target by organization Unit level
  Given authorized user at national level
  When opening scorecard form
  And selecting specific indicator
  And selecting target by organization unit level in legend settings
  And configure target legends in organization unit level and add
  And click specific target library button
  Then a page with configured organization unit level target should appear
 
 @focus
 Scenario: Setting of a specific target by organization Units
 Given authorized user at national level
 When opening scorecard form
 And selecting specific indicator
 And selecting target by organization unit in legend settings
 And configure target legends in organization unit and add
 And click specific target library button
 Then a page with configured organization unit target should appear





