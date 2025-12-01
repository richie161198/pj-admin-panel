"use client";
import React, { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import Icon from "@/components/ui/Icon";

const Modal = ({
  activeModal = false, // ✅ Safe default
  onClose = () => {},
  enterFrom = "scale-95",
  leaveFrom = "scale-100",
  disableBackdrop = false,
  className = "max-w-lg",
  children,
  footerContent,
  centered = true,
  scrollContent = false,
  title,
  uncontrolled = false,
  label = "Basic Modal",
  labelClass = "",
  isBlur = false,
  ref,
}) => {
  const [showModal, setShowModal] = useState(false);

  const closeModal = () => setShowModal(false);
  const openModal = () => setShowModal(true);
  const returnNull = () => null;

  // Determine which show value to use
  const showValue = uncontrolled ? showModal : activeModal ?? false;

  return (
    <>
      {/* ✅ Uncontrolled (self-triggered) */}
      {uncontrolled ? (
        <>
          <button
            type="button"
            onClick={openModal}
            className={`btn ${labelClass}`}
          >
            {label}
          </button>

          <Transition appear show={showValue} as={Fragment}>
            <Dialog
              as="div"
              className="relative z-[99999]"
              onClose={!disableBackdrop ? closeModal : returnNull}
            >
              {!disableBackdrop && (
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div
                    className={`fixed inset-0 bg-gray-900/70 backdrop-filter ${
                      isBlur ? "backdrop-blur-sm" : ""
                    }`}
                  />
                </Transition.Child>
              )}

              <div className="fixed inset-0 overflow-y-auto">
                <div
                  className={`flex min-h-full justify-center text-center p-6 ${
                    centered ? "items-center" : "items-start"
                  }`}
                >
                  <Transition.Child
                    as={Fragment}
                    enter="duration-300 ease-out"
                    enterFrom={`opacity-0 ${enterFrom}`}
                    enterTo={`opacity-100 ${leaveFrom}`}
                    leave="duration-200 ease-in"
                    leaveFrom={`opacity-100 ${leaveFrom}`}
                    leaveTo={`opacity-0 ${enterFrom}`}
                  >
                    <Dialog.Panel
                      className={`w-full transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left align-middle shadow-base transition-all ${className}`}
                    >
                      {/* Header */}
                      {title && (
                        <div className="relative py-4 px-5 text-gray-700 border-b border-gray-100 flex justify-between dark:text-gray-300">
                          <h2 className="capitalize leading-6 tracking-wider font-medium text-base">
                            {title}
                          </h2>
                          <button onClick={closeModal} className="text-[22px]">
                            <Icon icon="heroicons-outline:x" />
                          </button>
                        </div>
                      )}

                      {/* Body */}
                      <div
                        className={`px-6 py-8 ${
                          scrollContent
                            ? "overflow-y-auto max-h-[400px]"
                            : ""
                        }`}
                      >
                        {children}
                      </div>

                      {/* Footer */}
                      {footerContent && (
                        <div className="px-4 py-3 flex justify-end space-x-3 border-t border-gray-100 dark:border-gray-700">
                          {footerContent}
                        </div>
                      )}
                    </Dialog.Panel>
                  </Transition.Child>
                </div>
              </div>
            </Dialog>
          </Transition>
        </>
      ) : (
        // ✅ Controlled (external trigger)
        <Transition appear show={showValue} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-[99999]"
            onClose={!disableBackdrop ? onClose : returnNull}
          >
            {!disableBackdrop && (
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div
                  className={`fixed inset-0 bg-gray-900/70 backdrop-filter ${
                    isBlur ? "backdrop-blur-sm" : ""
                  }`}
                />
              </Transition.Child>
            )}

            <div className="fixed inset-0 overflow-y-auto">
              <div
                className={`flex min-h-full justify-center text-center p-6 ${
                  centered ? "items-center" : "items-start"
                }`}
              >
                <Transition.Child
                  as={Fragment}
                  enter="duration-300 ease-out"
                  enterFrom={`opacity-0 ${enterFrom}`}
                  enterTo={`opacity-100 ${leaveFrom}`}
                  leave="duration-200 ease-in"
                  leaveFrom={`opacity-100 ${leaveFrom}`}
                  leaveTo={`opacity-0 ${enterFrom}`}
                >
                  <Dialog.Panel
                    className={`w-full transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left align-middle shadow-base transition-all ${className}`}
                  >
                    {/* Header */}
                    {title && (
                      <div className="relative py-4 px-5 text-gray-700 border-b border-gray-100 flex justify-between dark:text-gray-300">
                        <h2 className="capitalize leading-6 tracking-wider font-medium text-base">
                          {title}
                        </h2>
                        <button onClick={onClose} className="text-[22px]">
                          <Icon icon="heroicons-outline:x" />
                        </button>
                      </div>
                    )}

                    {/* Body */}
                    <div
                      className={`px-6 py-8 ${
                        scrollContent ? "overflow-y-auto max-h-[400px]" : ""
                      }`}
                    >
                      {children}
                    </div>

                    {/* Footer */}
                    {footerContent && (
                      <div className="px-4 py-3 flex justify-end space-x-3 border-t border-gray-100 dark:border-gray-700">
                        {footerContent}
                      </div>
                    )}
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      )}
    </>
  );
};

export default Modal;
