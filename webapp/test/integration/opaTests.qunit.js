sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'zveobapprove/test/integration/FirstJourney',
		'zveobapprove/test/integration/pages/ApprovalList',
		'zveobapprove/test/integration/pages/ApprovalObjectPage'
    ],
    function(JourneyRunner, opaJourney, ApprovalList, ApprovalObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('zveobapprove') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheApprovalList: ApprovalList,
					onTheApprovalObjectPage: ApprovalObjectPage
                }
            },
            opaJourney.run
        );
    }
);