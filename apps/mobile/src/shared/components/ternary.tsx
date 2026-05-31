import React from 'react';

type TernaryProps = {
  condition: boolean;
  trueComponent: React.ReactNode;
  falseComponent: React.ReactNode;
};

export const Ternary = ({ condition, trueComponent, falseComponent }: TernaryProps) => {
  return condition ? trueComponent : falseComponent;
};
