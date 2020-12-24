const randomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

const getRandomStateNeq = (state, numbers) => {
  const nums = { ...numbers };
  delete nums[state];
  return randomElement(Object.values(nums));
};

module.exports = {
  outState: (governorPhones) => {
    const result = { ...governorPhones };
    Object.keys(result).map((state) => {
      result[state] = getRandomStateNeq(state, governorPhones);
    });
    return result;
  },
};
