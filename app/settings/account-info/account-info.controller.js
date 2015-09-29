(function () {
  'use strict';

  angular.module('tc.settings').controller('AccountInfoController', AccountInfoController);

  AccountInfoController.$inject = ['userData', 'UserService', 'ProfileService', '$log', 'ISO3166', 'toaster'];

  function AccountInfoController(userData, UserService, ProfileService, $log, ISO3166, toaster) {
    var vm = this;
    vm.saveAccountInfo = saveAccountInfo;
    vm.updateCountry   = updateCountry;
    vm.isSocialRegistrant = false;
    vm.formProcessing = {
      accountInfoForm: false,
      newPasswordForm: false
    };

    activate();

    function activate() {
      processData();
      vm.userData = _.clone(userData, true);
      UserService.getUserProfile({fields: 'credential'})
      .then(function(res) {
        vm.isSocialRegistrant = !res.credential.hasPassword;
      })
      .catch(function(err) {
        $log.error("Error fetching user profile. Redirecting to edit profile.");
        $state.go('settings.profile');
      });

      vm.countries = ISO3166.getAllCountryObjects();
      vm.countryObj = ISO3166.getCountryObjFromAlpha3(userData.homeCountryCode);
    }

    function updateCountry(angucompleteCountryObj) {
      var countryCode = _.get(angucompleteCountryObj, 'originalObject.alpha3', undefined);

      var isValidCountry = _.isUndefined(countryCode) ? false : true;
      vm.accountInfoForm.country.$setValidity('required', isValidCountry);
    }

    function saveAccountInfo() {
      vm.formProcessing.accountInfoForm = true;
      ProfileService.updateUserProfile(userData)
      .then(function(data) {
        vm.formProcessing.accountInfoForm = false;
        toaster.pop('success', "Success!", "Your account information was updated.");
      })
      .catch(function() {
        vm.formProcessing.accountInfoForm = false;
        toaster.pop('error', "Whoops!", "Something went wrong. Please try again later.");
      })
    }

    function processData() {
      vm.homeAddress = _.find(userData.addresses, {type: 'HOME'}) || {};
    }

    function submitNewPassword() {
      vm.formProcessing.newPasswordForm = true;
      UserService.updatePassword(vm.newPassword, vm.currentPassword)
      .then(function() {
        vm.formProcessing.newPasswordForm = false;
        vm.newPassword = '';
        vm.currentPassword = '';
        toaster.pop('success', "Success", "Password successfully updated");
        vm.newPasswordForm.$setPristine();
        vm.currentPasswordFocus = false;
        // vm.placeholder = vm.defaultPlaceholder;
        // vm.currentPasswordPlaceholder = vm.currentPasswordDefaultPlaceholder;

        $log.info('Your password has been updated.');
      })
      .catch(function(err) {
        vm.formProcessing.newPasswordForm = false;
        $log.error(err);
      });
    }
  }
})();
