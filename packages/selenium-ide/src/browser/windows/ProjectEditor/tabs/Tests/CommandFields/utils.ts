export const setField =
  (name: string) => (testID: string, commandID: string) => (value: string) => {
    window.sideAPI.tests.updateStep(testID, commandID, {
      [name]: value,
    })
  }

export const updateACField =
  (name: string) =>
  (testID: string, commandID: string) =>
  (_e: any, v: any) => {
    window.sideAPI.tests.updateStep(testID, commandID, {
      [name]: v.id,
    })
  }

export const updateField =
  (name: string) => (testID: string, commandID: string) => (e: any) => {
    window.sideAPI.tests.updateStep(testID, commandID, {
      [name]: e.target.value,
    })
  }

export const updateFieldAutoComplete =
  (name: string) =>
  (testID: string, commandID: string) =>
  (_e: any, value: string) => {
    window.sideAPI.tests.updateStep(testID, commandID, {
      [name]: value,
    })
  }
