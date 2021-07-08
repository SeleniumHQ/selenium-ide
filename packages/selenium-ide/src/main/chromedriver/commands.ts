import { Session } from '../types'

const commands = {
  add_selection:
    (session: Session) =>
    async (...args: any[]) => {},

  answer_on_next_prompt:
    (session: Session) =>
    async (...args: any[]) => {},

  assert:
    (session: Session) =>
    async (...args: any[]) => {},

  assert_alert:
    (session: Session) =>
    async (...args: any[]) => {},

  assert_checked:
    (session: Session) =>
    async (...args: any[]) => {},

  assert_confirmation:
    (session: Session) =>
    async (...args: any[]) => {},

  assert_editable:
    (session: Session) =>
    async (...args: any[]) => {},

  assert_element_present:
    (session: Session) =>
    async (...args: any[]) => {},

  assert_element_not_present:
    (session: Session) =>
    async (...args: any[]) => {},

  assert_not_checked:
    (session: Session) =>
    async (...args: any[]) => {},

  assert_not_editable:
    (session: Session) =>
    async (...args: any[]) => {},

  assert_not_selected_value:
    (session: Session) =>
    async (...args: any[]) => {},

  assert_not_text:
    (session: Session) =>
    async (...args: any[]) => {},

  assert_prompt:
    (session: Session) =>
    async (...args: any[]) => {},

  assert_selected_value:
    (session: Session) =>
    async (...args: any[]) => {},

  assert_selected_label:
    (session: Session) =>
    async (...args: any[]) => {},

  assert_text:
    (session: Session) =>
    async (...args: any[]) => {},

  assert_title:
    (session: Session) =>
    async (...args: any[]) => {},

  assert_value:
    (session: Session) =>
    async (...args: any[]) => {},

  check:
    (session: Session) =>
    async (...args: any[]) => {},

  choose_cancel_on_next_confirmation:
    (session: Session) =>
    async (...args: any[]) => {},

  choose_cancel_on_next_prompt:
    (session: Session) =>
    async (...args: any[]) => {},

  choose_ok_on_next_confirmation:
    (session: Session) =>
    async (...args: any[]) => {},

  click:
    (session: Session) =>
    async (...args: any[]) => {},

  click_at:
    (session: Session) =>
    async (...args: any[]) => {},

  close:
    (session: Session) =>
    async (...args: any[]) => {},

  debugger:
    (session: Session) =>
    async (...args: any[]) => {},

  do:
    (session: Session) =>
    async (...args: any[]) => {},

  double_click:
    (session: Session) =>
    async (...args: any[]) => {},

  double_click_at:
    (session: Session) =>
    async (...args: any[]) => {},

  drag_and_drop_to_object:
    (session: Session) =>
    async (...args: any[]) => {},

  echo:
    (session: Session) =>
    async (...args: any[]) => {},

  edit_content:
    (session: Session) =>
    async (...args: any[]) => {},

  else:
    (session: Session) =>
    async (...args: any[]) => {},

  else_if:
    (session: Session) =>
    async (...args: any[]) => {},

  end:
    (session: Session) =>
    async (...args: any[]) => {},

  execute_script:
    (session: Session) =>
    async (...args: any[]) => {},

  execute_async_script:
    (session: Session) =>
    async (...args: any[]) => {},

  for_each:
    (session: Session) =>
    async (...args: any[]) => {},

  if:
    (session: Session) =>
    async (...args: any[]) => {},

  mouse_down:
    (session: Session) =>
    async (...args: any[]) => {},

  mouse_down_at:
    (session: Session) =>
    async (...args: any[]) => {},

  mouse_move_at:
    (session: Session) =>
    async (...args: any[]) => {},

  mouse_out:
    (session: Session) =>
    async (...args: any[]) => {},

  mouse_over:
    (session: Session) =>
    async (...args: any[]) => {},

  mouse_up:
    (session: Session) =>
    async (...args: any[]) => {},

  mouse_up_at:
    (session: Session) =>
    async (...args: any[]) => {},

  open:
    (session: Session) =>
    async (...args: any[]) => {},

  pause:
    (session: Session) =>
    async (...args: any[]) => {},

  remove_selection:
    (session: Session) =>
    async (...args: any[]) => {},

  repeat_if:
    (session: Session) =>
    async (...args: any[]) => {},

  run:
    (session: Session) =>
    async (...args: any[]) => {},

  run_script:
    (session: Session) =>
    async (...args: any[]) => {},

  select:
    (session: Session) =>
    async (...args: any[]) => {},

  select_frame:
    (session: Session) =>
    async (...args: any[]) => {},

  select_window:
    (session: Session) =>
    async (...args: any[]) => {},

  send_keys:
    (session: Session) =>
    async (...args: any[]) => {},

  set_speed:
    (session: Session) =>
    async (...args: any[]) => {},

  set_window_size:
    (session: Session) =>
    async (...args: any[]) => {},

  store:
    (session: Session) =>
    async (...args: any[]) => {},

  store_attribute:
    (session: Session) =>
    async (...args: any[]) => {},

  store_json:
    (session: Session) =>
    async (...args: any[]) => {},

  store_text:
    (session: Session) =>
    async (...args: any[]) => {},

  store_title:
    (session: Session) =>
    async (...args: any[]) => {},

  store_value:
    (session: Session) =>
    async (...args: any[]) => {},

  store_window_handle:
    (session: Session) =>
    async (...args: any[]) => {},

  store_xpath_count:
    (session: Session) =>
    async (...args: any[]) => {},

  submit:
    (session: Session) =>
    async (...args: any[]) => {},

  times:
    (session: Session) =>
    async (...args: any[]) => {},

  type:
    (session: Session) =>
    async (...args: any[]) => {},

  uncheck:
    (session: Session) =>
    async (...args: any[]) => {},

  verify:
    (session: Session) =>
    async (...args: any[]) => {},

  verify_checked:
    (session: Session) =>
    async (...args: any[]) => {},

  verify_editable:
    (session: Session) =>
    async (...args: any[]) => {},

  verify_element_present:
    (session: Session) =>
    async (...args: any[]) => {},

  verify_element_not_present:
    (session: Session) =>
    async (...args: any[]) => {},

  verify_not_checked:
    (session: Session) =>
    async (...args: any[]) => {},

  verify_not_editable:
    (session: Session) =>
    async (...args: any[]) => {},

  verify_not_selected_value:
    (session: Session) =>
    async (...args: any[]) => {},

  verify_not_text:
    (session: Session) =>
    async (...args: any[]) => {},

  verify_selected_label:
    (session: Session) =>
    async (...args: any[]) => {},

  verify_selected_value:
    (session: Session) =>
    async (...args: any[]) => {},

  verify_text:
    (session: Session) =>
    async (...args: any[]) => {},

  verify_title:
    (session: Session) =>
    async (...args: any[]) => {},

  verify_value:
    (session: Session) =>
    async (...args: any[]) => {},

  wait_for_element_editable:
    (session: Session) =>
    async (...args: any[]) => {},

  wait_for_element_not_editable:
    (session: Session) =>
    async (...args: any[]) => {},

  wait_for_element_not_present:
    (session: Session) =>
    async (...args: any[]) => {},

  wait_for_element_not_visible:
    (session: Session) =>
    async (...args: any[]) => {},

  wait_for_element_present:
    (session: Session) =>
    async (...args: any[]) => {},

  wait_for_element_visible:
    (session: Session) =>
    async (...args: any[]) => {},

  wait_for_text:
    (session: Session) =>
    async (...args: any[]) => {},

  webdriver_answer_on_visible_prompt:
    (session: Session) =>
    async (...args: any[]) => {},

  webdriver_choose_cancel_on_visible_confirmation:
    (session: Session) =>
    async (...args: any[]) => {},

  webdriver_choose_cancel_on_visible_prompt:
    (session: Session) =>
    async (...args: any[]) => {},

  webdriver_choose_ok_on_visible_confirmation:
    (session: Session) =>
    async (...args: any[]) => {},

  while:
    (session: Session) =>
    async (...args: any[]) => {},
}
