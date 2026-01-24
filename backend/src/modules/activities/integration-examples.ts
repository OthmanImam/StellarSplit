/**
 * Integration Examples for Activity Tracking
 * 
 * This file demonstrates how to integrate activity tracking
 * into various services within the StellarSplit application.
 */

import { Injectable } from '@nestjs/common';
import { ActivitiesService } from '../activities/activities.service';

/**
 * Example 1: Payment Service Integration
 * Track payment-related activities
 */
@Injectable()
export class PaymentServiceExample {
    constructor(private readonly activitiesService: ActivitiesService) { }

    async processPayment(
        userId: string,
        splitId: string,
        amount: number,
        txHash: string,
        asset: string
    ) {
        try {
            // Process payment logic here...
            // const result = await this.stellarService.submitPayment(...);

            // Track the payment made activity
            await this.activitiesService.trackPaymentMade(
                userId,
                splitId,
                amount,
                txHash,
                {
                    asset,
                    timestamp: new Date().toISOString(),
                    status: 'confirmed'
                }
            );

            // Notify recipient(s) - they'll get payment_received activities
            // const recipients = await this.getRecipients(splitId);
            // for (const recipient of recipients) {
            //   await this.activitiesService.trackPaymentReceived(
            //     recipient.userId,
            //     splitId,
            //     amount,
            //     txHash,
            //     userId, // from address
            //     { asset }
            //   );
            // }
        } catch (error) {
            console.error('Payment processing failed:', error);
            throw error;
        }
    }
}

/**
 * Example 2: Split Creation Service Integration
 * Track split lifecycle events
 */
@Injectable()
export class SplitServiceExample {
    constructor(private readonly activitiesService: ActivitiesService) { }

    async createSplit(
        creatorId: string,
        totalAmount: number,
        description: string,
        participants: string[]
    ) {
        // Create split logic...
        const splitId = 'generated-uuid';

        // Track split creation
        await this.activitiesService.trackSplitCreated(
            creatorId,
            splitId,
            {
                totalAmount,
                description,
                participantCount: participants.length,
                currency: 'USDC'
            }
        );

        // Track participants added
        for (const participantAddress of participants) {
            // Creator gets notified about each participant
            await this.activitiesService.trackParticipantAdded(
                creatorId,
                splitId,
                participantAddress,
                { role: 'participant' }
            );

            // Each participant also gets notified they were added
            // (You might want to avoid this for the creator)
            if (participantAddress !== creatorId) {
                await this.activitiesService.trackParticipantAdded(
                    participantAddress,
                    splitId,
                    participantAddress,
                    {
                        role: 'participant',
                        addedBy: creatorId
                    }
                );
            }
        }

        return splitId;
    }

    async updateSplit(
        userId: string,
        splitId: string,
        changes: { totalAmount?: number; description?: string }
    ) {
        // Update split logic...

        // Track the edit
        await this.activitiesService.trackSplitEdited(
            userId,
            splitId,
            changes,
            { editedAt: new Date().toISOString() }
        );

        // Optionally notify other participants about the change
        // const participants = await this.getParticipants(splitId);
        // for (const participant of participants) {
        //   if (participant.userId !== userId) {
        //     await this.activitiesService.trackSplitEdited(
        //       participant.userId,
        //       splitId,
        //       changes,
        //       { editedBy: userId }
        //     );
        //   }
        // }
    }

    async completeSplit(splitId: string, participants: string[]) {
        // Complete split logic...

        // Notify all participants
        for (const userId of participants) {
            await this.activitiesService.trackSplitCompleted(
                userId,
                splitId,
                {
                    completedAt: new Date().toISOString(),
                    status: 'fully_paid'
                }
            );
        }
    }
}

/**
 * Example 3: Reminder Service Integration
 * Track reminder notifications
 */
@Injectable()
export class ReminderServiceExample {
    constructor(private readonly activitiesService: ActivitiesService) { }

    async sendPaymentReminder(
        senderId: string,
        recipientId: string,
        splitId: string,
        amountDue: number
    ) {
        // Send reminder logic (email, push notification, etc.)...

        // Track reminder sent for sender
        await this.activitiesService.trackReminderSent(
            senderId,
            splitId,
            recipientId,
            {
                amountDue,
                reminderType: 'payment_due',
                sentAt: new Date().toISOString()
            }
        );

        // Optionally track as a received reminder for recipient
        // This could use the same tracking or a different approach
        // depending on your UX requirements
    }
}

/**
 * Example 4: Bulk Activity Tracking
 * Useful for batch operations or migrations
 */
@Injectable()
export class BulkActivityExample {
    constructor(private readonly activitiesService: ActivitiesService) { }

    async trackBulkActivities(activities: Array<{
        userId: string;
        type: 'payment_made' | 'payment_received';
        splitId: string;
        amount: number;
        txHash: string;
    }>) {
        // Process activities in parallel for better performance
        await Promise.all(
            activities.map(async (activity) => {
                if (activity.type === 'payment_made') {
                    await this.activitiesService.trackPaymentMade(
                        activity.userId,
                        activity.splitId,
                        activity.amount,
                        activity.txHash
                    );
                } else {
                    await this.activitiesService.trackPaymentReceived(
                        activity.userId,
                        activity.splitId,
                        activity.amount,
                        activity.txHash,
                        'unknown' // sender address if available
                    );
                }
            })
        );
    }
}

/**
 * Example 5: Custom Metadata Usage
 * Leverage the flexible metadata field for rich activity data
 */
@Injectable()
export class CustomMetadataExample {
    constructor(private readonly activitiesService: ActivitiesService) { }

    async trackPaymentWithCustomData(
        userId: string,
        splitId: string,
        amount: number,
        txHash: string
    ) {
        await this.activitiesService.trackPaymentMade(
            userId,
            splitId,
            amount,
            txHash,
            {
                // Payment details
                asset: 'USDC',
                network: 'stellar',

                // User context
                deviceType: 'mobile',
                appVersion: '1.2.3',

                // Split context
                splitName: 'Dinner at Restaurant',
                category: 'food',

                // Timing
                processedAt: new Date().toISOString(),

                // Additional data
                isFirstPayment: true,
                completionPercentage: 50,

                // You can add any JSON-serializable data
                customFields: {
                    referenceNumber: 'REF-12345',
                    notes: 'Paid via mobile app'
                }
            }
        );
    }
}

/**
 * Example 6: Error Handling and Graceful Degradation
 * Activity tracking should not break core functionality
 */
@Injectable()
export class RobustIntegrationExample {
    constructor(private readonly activitiesService: ActivitiesService) { }

    async processPaymentWithGracefulTracking(
        userId: string,
        splitId: string,
        amount: number,
        txHash: string
    ) {
        // Core payment processing
        // const paymentResult = await this.stellarService.submitPayment(...);

        // Track activity, but don't let tracking failures affect payment
        try {
            await this.activitiesService.trackPaymentMade(
                userId,
                splitId,
                amount,
                txHash,
                { timestamp: new Date().toISOString() }
            );
        } catch (error) {
            // Log the error but don't throw
            console.error('Failed to track activity:', error);
            // Optionally send to error monitoring service
            // await this.errorMonitoring.captureException(error);
        }

        // Return payment result regardless of tracking status
        return { success: true, txHash };
    }
}

/**
 * Example 7: Conditional Activity Tracking
 * Track activities based on user preferences
 */
@Injectable()
export class ConditionalTrackingExample {
    constructor(private readonly activitiesService: ActivitiesService) { }

    async trackActivityIfEnabled(
        userId: string,
        activityType: string,
        splitId: string,
        metadata: any
    ) {
        // Check user preferences (this would come from a user settings service)
        const userPreferences = await this.getUserPreferences(userId);

        if (!userPreferences.activityFeedEnabled) {
            return; // Skip tracking
        }

        // Check if this specific activity type is enabled
        if (userPreferences.disabledActivityTypes?.includes(activityType)) {
            return; // Skip tracking
        }

        // Track the activity
        switch (activityType) {
            case 'payment_made':
                await this.activitiesService.trackPaymentMade(
                    userId,
                    splitId,
                    metadata.amount,
                    metadata.txHash,
                    metadata
                );
                break;
            // ... other cases
        }
    }

    private async getUserPreferences(userId: string) {
        // Mock implementation
        return {
            activityFeedEnabled: true,
            disabledActivityTypes: []
        };
    }
}

export {
    PaymentServiceExample,
    SplitServiceExample,
    ReminderServiceExample,
    BulkActivityExample,
    CustomMetadataExample,
    RobustIntegrationExample,
    ConditionalTrackingExample
};
