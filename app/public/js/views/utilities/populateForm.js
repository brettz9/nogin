/* globals $ */

const populateForm = (sel, {
  heading,
  subheading,
  action1,
  action2
}) => {
  // customize the account settings form
  $(sel + ' h1.dialog').text(heading);
  $(sel + ' h2.dialog').text(subheading);
  $(sel + ' [data-name=action1]').text(action1);
  $(sel + ' [data-name=action2]').text(action2);
  return $(sel);
};

export default populateForm;
